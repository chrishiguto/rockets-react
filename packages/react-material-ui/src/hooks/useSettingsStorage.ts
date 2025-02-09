import { useState, useEffect } from 'react';
import debounce from 'lodash/debounce';
import useDataProvider, { useQuery } from '@concepta/react-data-provider';
import { useAuth } from '@concepta/react-auth-provider';

/**
 * Type of the cache assignee info, with id being an user id.
 */
type Assignee = {
  id: string;
};

/**
 * Type of the orderable items used in the OrderableDropDown component.
 *
 * @see {@link OrderableDropDown}
 */
type ListItem = {
  id: string;
  label: string;
  hide?: boolean;
};

/**
 * Type of the object containing info related to cache, orderable items and localStorage.
 */
type Settings = {
  key: string;
  assignee: Assignee;
  type: string;
  data: ListItem[];
};

/**
 * Common data returned by the cache module endpoints.
 */
type CacheResponse = {
  id: string;
  dateCreated: string;
  dateUpdated: string;
  dateDeleted?: string;
  version: number;
  key: string;
  type: string;
  assignee: Assignee;
  data: string;
};

type Props = {
  setListCallback?: (list?: Settings['data']) => void;
  cacheApiPath?: string;
} & Omit<Settings, 'assignee'>;

/**
 * @param data - Stringified data array returned from the API.
 * @returns Parseable settings array string.
 */
const parseDataStringToSettings = (data: string) => {
  return JSON.parse(data.replace(/'/g, '"'));
};

/**
 * @param data - Stringified settings array.
 * @returns Stringified array that can be read by API endpoints.
 */
const parseSettingsToDataString = (data: string) => {
  return data.replace(/"/g, "'");
};

const DEBOUNCE_TIME_IN_MS = 1500;

const getSettingsFromStorage = (params: Omit<Settings, 'data'>) => {
  const storageItem = JSON.parse(localStorage.getItem(params.type));

  if (!storageItem) {
    return [];
  }

  const settingsItem = storageItem.find(
    ({ assignee, key }: Settings) =>
      assignee.id === params.assignee.id && key === params.key,
  );

  return settingsItem ? settingsItem.data : [];
};

const getSettingsFromCacheList = (
  params: Omit<Settings, 'data'> & { cacheList: CacheResponse[] },
) => {
  const settingsItem = params.cacheList.find(
    (item) =>
      item.key === params.key &&
      item.type === params.type &&
      item.assignee.id === params.assignee.id,
  );

  if (!settingsItem) {
    return null;
  }

  return {
    ...settingsItem,
    data: parseDataStringToSettings(settingsItem.data),
  };
};

const updateSettingsStorage = (params: Settings) => {
  const storageItem = JSON.parse(localStorage.getItem(params.type));

  if (!storageItem) {
    localStorage.setItem(params.type, JSON.stringify([params]));
    return;
  }

  const settingsItemIndex = storageItem.findIndex(
    (item: Settings) =>
      item.assignee.id === params.assignee.id && item.key === params.key,
  );

  if (settingsItemIndex > -1) {
    storageItem[settingsItemIndex] = params;
  } else {
    storageItem.push(params);
  }

  localStorage.setItem(params.type, JSON.stringify(storageItem));
};

const deleteSettingsStorage = (params: Omit<Settings, 'data'>) => {
  const storageItem = JSON.parse(localStorage.getItem(params.type));

  if (!storageItem || !storageItem?.length) {
    return;
  }

  let updatedStorageItem = [...storageItem];

  const settingsItemIndex = storageItem.findIndex(
    ({ assignee, key }: Settings) =>
      assignee.id === params.assignee.id && key === params.key,
  );

  if (settingsItemIndex > -1) {
    updatedStorageItem = storageItem.splice(settingsItemIndex, 1);
  }

  localStorage.setItem(params.type, JSON.stringify(updatedStorageItem));
};

/**
 * Hook for managing fetch/update state and cache for the OrderableDropDown
 * component. The localStorage and cache module are used for this, with localStorage
 * being the primary source of information. If settings are present in localStorage, BE
 * data is not used. If not, a lookup is performed in the api to check if there's cache of
 * the type passed via props.
 *
 * @returns Object containing the settings array and the updateSettings and clearSettings methods.
 */
export const useSettingsStorage = (props: Props) => {
  const [cacheId, setCacheId] = useState<CacheResponse['id']>('');
  const [settings, setSettings] = useState<Settings['data']>([]);

  const auth = useAuth();

  const { get, put, del } = useDataProvider();

  const cacheConfig = {
    key: props.key || window.location.pathname,
    type: props.type,
    assignee: {
      id: auth?.user ? (auth.user as { id: string }).id : '',
    },
  };

  const { execute: createCache } = useQuery(
    (cache: string) =>
      put({
        uri: `${props.cacheApiPath}/${crypto.randomUUID()}`,
        body: {
          ...cacheConfig,
          data: cache,
        },
      }),
    false,
    {
      onSuccess: (res: CacheResponse) => setCacheId(res.id),
    },
  );

  const { execute: updateCache } = useQuery(
    (list: Settings['data']) =>
      put({
        uri: `${props.cacheApiPath}/${cacheId}`,
        body: {
          ...cacheConfig,
          data: parseSettingsToDataString(JSON.stringify(list)),
        },
      }),
    false,
    {
      onSuccess: (res: CacheResponse) => setCacheId(res.id),
    },
  );

  const { execute: deleteCache } = useQuery(
    () => del({ uri: `${props.cacheApiPath}/${cacheId}` }),
    false,
    { onSuccess: () => setCacheId('') },
  );

  const { execute: fetchOrCreateCache } = useQuery(
    () => get({ uri: props.cacheApiPath }),
    false,
    {
      onSuccess: (fetchedData: CacheResponse[]) => {
        const cachedSettings = getSettingsFromCacheList({
          ...cacheConfig,
          cacheList: fetchedData,
        });

        if (!cachedSettings) {
          createCache(parseSettingsToDataString(JSON.stringify(props.data)));
          return;
        }

        if (cachedSettings) {
          setCacheId(cachedSettings.id);
          if (!getSettingsFromStorage(cacheConfig).length) {
            setSettings(cachedSettings.data);
            props.setListCallback(cachedSettings.data);
          }
        }
      },
    },
  );

  const debouncedCacheUpdate = debounce(
    (items: Settings['data']) => updateCache(items),
    DEBOUNCE_TIME_IN_MS,
  );

  const updateSettings = (items: Settings['data']) => {
    setSettings(items);
    updateSettingsStorage({
      ...cacheConfig,
      data: items,
    });

    if (props.cacheApiPath) {
      debouncedCacheUpdate(items);
    }
  };

  const clearSettings = () => {
    deleteSettingsStorage(cacheConfig);

    if (props.cacheApiPath) {
      deleteCache();
    }
  };

  useEffect(() => {
    const storageData = getSettingsFromStorage(cacheConfig);

    if (storageData.length) {
      setSettings(storageData);
      props.setListCallback(storageData);
    }

    if (props.cacheApiPath) {
      fetchOrCreateCache();
    }
  }, [auth?.user]);

  return { settings, updateSettings, clearSettings };
};
