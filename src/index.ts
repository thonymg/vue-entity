import { DataEntity, Entity } from './../typings/index'

export default (key = 'id', sorterFn = null) => {
  const _key = key
  let localState = {
    ids: [],
    hasDetailsIds: [],
    entities: {},
    details: {},
  } as DataEntity

  const initialState = (): DataEntity => localState

  let sortCb = (a: Entity, b: Entity): number => {
    return a.id - b.id
  }

  if (sorterFn) {
    sortCb = sorterFn
  }

  const listToObjectWithId = (list: any[] = [], key: string = _key): DataEntity => {
    const ids = list.map(i => i[key]) as never[]
    const objectFromList = list.reduce((obj, item) => {
      return {
        ...obj,
        [item[key]]: item,
      }
    }, {})
    localState = {
      entities: objectFromList,
      ids,
      hasDetailsIds: [],
      details: {},
    }
    return localState
  }

  const upsertObject = (modifier: Entity, id: never) => {
    return (dataEntityToEdit: DataEntity): DataEntity => {
      const { ids, entities, ...previousState } = dataEntityToEdit
      const editedObject = { ...entities[id], ...modifier }
      const newIds = ids.includes(id) ? ids : ids.concat(id)
      localState = {
        ...{
          entities: { ...dataEntityToEdit.entities, ...{ [id]: editedObject } },
        },
        ids: newIds,
        ...previousState,
      }
      return localState
    }
  }

  const deleteObject = (id: never) => {
    return (dataEntityToEdit: any): DataEntity => {
      const { ids } = dataEntityToEdit

      const newIds = ids.includes(id) ? ids.filter((i: any) => i !== id) : ids
      delete dataEntityToEdit.entities[id]
      localState = {
        ...dataEntityToEdit,
        ids: newIds,
      }

      return localState
    }
  }

  const addManyObject = (objectsToAdd: any[], key: string = _key) => {
    return (listToEdit: DataEntity): DataEntity => {
      const { ids, ...previousState } = listToObjectWithId(objectsToAdd, key)

      const newIds = [...ids, ...listToEdit.ids] as any
      const newEntities = {
        entities: { ...listToEdit.entities, ...previousState.entities },
      }
      localState = {
        ...previousState,
        ...newEntities,
        ids: newIds,
      }
      return localState
    }
  }

  const upsertDetailsOfObject = (modifier: any, key = _key) => {
    return (listToEdit: DataEntity) => {
      const { hasDetailsIds, details, ...previousState } = listToEdit
      const editedObject = { ...details[key], ...modifier }

      const modifierKey = modifier[key]

      const newIds = hasDetailsIds.includes(key as never)
        ? hasDetailsIds
        : hasDetailsIds.concat(modifierKey)
      localState = {
        ...{
          details: {
            ...listToEdit.details,
            ...{ [modifierKey]: editedObject },
          },
        },
        hasDetailsIds: newIds,
        ...previousState,
      }
      return localState
    }
  }

  const getEntryById = (entry: string) => {
    return (_state: any, id: string | number) => {
      if (_state && _state[entry]) {
        return _state[entry][id]
      }
    }
  }

  const isExist = (entry: string) => {
    return (_state: any, id: string | number) => {
      if (_state && _state[entry]) {
        return _state[entry].includes(id) ? true : false
      }
    }
  }

  const compareAndFind = (firstArray: any[], secondArray: any[]) => {
    return (callback: (a: any, b: any) => boolean) => {
      return firstArray.filter(firstElem => {
        return secondArray.find(secondElem => {
          return callback(firstElem, secondElem)
        })
      })
    }
  }

  const compareAndMergeWith = (
    firstArray: any[],
    secondArray: any[],
    nodes = 'nodes',
    key = _key,
  ) => {
    return (callback: (a: any, b: any) => boolean) => {
      const combinedData = [] as any[]
      firstArray.filter(firstElem => {
        const secondArrayToPush = [] as any[]
        return secondArray.filter(secondElem => {
          if (callback(firstElem, secondElem) === true) {
            secondArrayToPush.push(secondElem)
            combinedData.push({
              ...firstElem,
              ...{ [nodes]: secondArrayToPush },
            })
          }
        })
      })

      const map = new Map()
      const results = []
      for (const item of combinedData) {
        if (!map.has(item[key])) {
          map.set(item[key], true) // set any value to Map
          results.push({ ...item })
        }
      }

      return results
    }
  }

  const combienToDataEntities = (stateEntry: any, entities: any[]) => {
    return { ...stateEntry, ...entities }
  }

  return {
    initialState: initialState(),
    getLocalState: localState,
    setAllEntities: listToObjectWithId,
    upserEntity: upsertObject,
    deleteEntity: deleteObject,
    upsertManyEntities: addManyObject,
    upsertDetails: upsertDetailsOfObject,

    getEntityById: getEntryById('entities'),
    getDetailsById: getEntryById('details'),

    hasEntity: isExist('ids'),
    hasDetails: isExist('hasDetailsIds'),

    entityEntries: (state: DataEntity) => Object.entries(state.entities),
    detailsEntries: (state: DataEntity) => Object.entries(state.details),

    entitiesToArray: (state: DataEntity) => Object.values(state.entities).sort(sortCb as any),
    detailsToArray: (state: DataEntity) => Object.values(state.details).sort(sortCb as any),

    compareAndFind,
    compareAndMergeWith,
    combienToDataEntities,
  }
}
