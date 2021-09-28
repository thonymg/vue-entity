export default (key = 'id', sorterFn = null) => {
  const _key = key
  let localState = {
    ids: [],
    hasDetailsIds: [],
    entities: {},
    details: {},
  }
  const initialState = () => localState

  let sortCb = (a, b) => {
    return a.id - b.id
  }

  if (sorterFn) {
    sortCb = sorterFn
  }

  const listToObjectWithId = (list = [], key = _key) => {
    const ids = list.map(i => i[key])
    let objectFromList = list.reduce((obj, item) => {
      const { id, ...rest } = item
      return {
        ...obj,
        [item[key]]: item,
      }
    }, {})
    const hasDetailsIds = []
    localState = {
      entities: objectFromList,
      ids,
      hasDetailsIds,
      details: {},
    }
    return localState
  }

  const upsertObject = (modifier, id) => {
    return listToEdit => {
      const { ids, entities, ...previousState } = listToEdit
      const editedObject = { ...entities[id], ...modifier }
      const newIds = ids.includes(id) ? ids : ids.concat(id)
      localState = {
        ...{ entities: { ...listToEdit.entities, ...{ [id]: editedObject } } },
        ids: newIds,
        ...previousState,
      }
      return localState
    }
  }

  const deleteObject = id => {
    return listToEdit => {
      const { ids } = listToEdit
      const newIds = ids.includes(id) ? ids.filter(i => i !== id) : ids
      delete listToEdit.entities[id]
      localState = {
        ...listToEdit,
        ids: newIds,
      }

      return localState
    }
  }

  const addManyObject = (objectToAdd, key = _key) => {
    return listToEdit => {
      const { ids, ...previousState } = listToObjectWithId(objectToAdd, key)

      const newIds = [...ids, ...listToEdit.ids]
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

  const upsertDetailsOfObject = (modifier, key = _key) => {
    return listToEdit => {
      const { hasDetailsIds, details, ...previousState } = listToEdit
      const editedObject = { ...details[key], ...modifier }
      const newIds = hasDetailsIds.includes(key)
        ? hasDetailsIds
        : hasDetailsIds.concat(modifier[key])
      localState = {
        ...{
          details: {
            ...listToEdit.details,
            ...{ [modifier[key]]: editedObject },
          },
        },
        hasDetailsIds: newIds,
        ...previousState,
      }
      return localState
    }
  }

  const getEntryById = entry => {
    return (_state, id) => {
      if (_state && _state[entry]) {
        return _state[entry][id]
      }
    }
  }

  const isExist = entry => {
    return (_state, id) => {
      if (_state && _state[entry]) {
        return _state[entry].includes(id) ? true : false
      }
    }
  }

  const compareAndFind = (firstArray, secondArray) => {
    return callback => {
      return firstArray.filter(firstElem => {
        return secondArray.find(secondElem => {
          return callback(firstElem, secondElem)
        })
      })
    }
  }

  const compareAndMergeWith = (firstArray, secondArray, nodes = 'nodes', key = _key) => {
    return callback => {
      let combinedData = []
      firstArray.filter(firstElem => {
        let secondArrayToPush = []
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

    entityEntries: state => Object.entries(state.entities),
    detailsEntries: state => Object.entries(state.details),

    entitiesToArray: state => Object.values(state.entities).sort(sortCb),
    detailsToArray: state => Object.values(state.details).sort(sortCb),

    compareAndFind,
    compareAndMergeWith,
  }
}
