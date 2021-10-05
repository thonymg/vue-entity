# Vue-entity-manager

`Vue-antity-manager` is a tool to help you easily manage your states with vue / vuex. By providing structure and performance. It allows you to reduce the number of server requests with a caching system. It integrates perfectly with your existing architecture and tools you already use in your projects.

## Usage
### installation

```bash
npm i vue-entity-manager
```
or
```bash
yarn add vue-entity-manager
```

### Initialisation

```javascript
import entityStateManager from "vue-entity-manager";

const manager = entityStateManager("id");

```
`id` is the primary or unique key of each entity in your list. If you do not specify a value, `id` will be the default entry.


```javascript
export default {
  namespaced: true,
  state: () => ({
    dataEntities: manager.initialState,
    current: {},
  ...

   getters: {
    selectAllPostsDataEntities(state) {
      return state.dataEntities;
    },
  ...

```

### Entities

`dataEntities` contains the structure used by state-manager it is an arbitrary name. You can manage the structure manually or by using the following function `manager.combienToDataEntities( state.dataEntities, entities);`


```javascript
  actions: {
    async fetchFakeAPI(vuexContext, {}) {
      try {
        fetch("https://jsonplaceholder.typicode.com/posts")
          .then((response) => response.json())
          .then((data) => {
            vuexContext.commit("setFakeAPIPosts", data);
          })
          ...
    },
```

```javascript
...
 mutations: {
    setFakeAPIPosts(state, entities) {
      const posts = manager.setAllEntities(entities);
      state.dataEntities = { ...state.dataEntities, ...posts };
    },
  ...

```

OR

```javascript
...
 mutations: {
    setFakeAPIPosts(state, entities) {
      const posts = manager.setAllEntities(entities);
      state.dataEntities = manager.combienToDataEntities(
        state.dataEntities,
        posts
      );
    },
  ...
```

### Details

We are talking about `details` of all requests returned by id and which are not lists. The `details` have another entry in the `dataEntities` and are handled separately from the entities.


`manager.hasDetails(state.dataEntities, id)` allows you to check if the details with a specific `id` already exist in the store. The http request is no longer executed if the details `id = 50` have already been called once.

```javascript
...
  actions: {
    async fetchFakeAPIById({ commit, state }, {}) {

      const hasDetails = manager.hasDetails(state.dataEntities, 50);
      if (hasDetails === false) {
        try {
          fetch("https://jsonplaceholder.typicode.com/posts/50")
            .then((response) => response.json())
           ...

```

` manager.upsertDetails` is a curry function you can directly use it as follows `manager.upsertDetails(details)(state.dataEntities)` or as in the examples below.

```javascript
...
 mutations: {
     setFakeAPIPostsDetails(state, details) {
      const posts = manager.upsertDetails(details);
      state.dataEntities = {
        ...state.dataEntities,
        ...posts(state.dataEntities),
      };
    },
  ...

```

OR


```javascript
...
 mutations: {
    setFakeAPIPosts(state, entities) {
      const posts = manager.upsertDetails(details);
      state.dataEntities = manager.combienToDataEntities(
        state.dataEntities,
        posts(state.dataEntities))
      };
    },
  ...
```

### compareAndFind
If you need to filter a list by another list.

```javascript
...
 findPostByCommentsIds({ commit, state, rootState}) {
    const comments = manager.entitiesToArray(rootState.comments.dataEntities);
    const posts = manager.entitiesToArray(state.dataEntities);

    const _posts = compareAndFind(posts, comments)((posts, comment) => post.id === comment.postId)
    ...

```

### compareAndMergeWith
If you need to combine 2 object lists with an entry key for the second list.
```javascript
...
 postWithCommentss({ commit, state, rootState}) {
    const comments = manager.entitiesToArray(rootState.comments.dataEntities);
    const posts = manager.entitiesToArray(state.dataEntities);

    const postAndcomments = manager.compareAndMergeWith(
        posts,
        comments,
        "comments" //
      );
    ...

```


## Manager Collection Functions

  - `initialState` : Creates the initial state in the designated entry. eg `state.dataEntities`.
  -  `setAllEntities`: Structure the entities to be by the suiste added in the `state.dataEntities`.
  -  `upserEntity`: Add/update an entity in the `state.dataEntities`.
  -  `deleteEntity`: Delete an entity in the `state.dataEntities`.
  -  `upsertManyEntities`: Add/update many entities in the `state.dataEntities`.
  -  `upsertDetails`:  Add/update datails in the `state.dataEntities`.

  -  `getEntityById`: Takes an entity that already exists in the store
  -  `getDetailsById`: Takes an details that already exists in the store

  -  `hasEntity`: Check if the entity already exists in the store.
  -  `hasDetails`: Check if the datails already exists in the store.

  -  `entitiesToArray`: Transform entities into entity list without changing the default structure
  -  `detailsToArray`: Transform entities into entity list without changing the default structure
    `combienToDataEntities`: Combine entities or details with `state.dataEntities`

