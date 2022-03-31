# ![RealWorld Example App](logo.png)

> ### AdonisJS 5 codebase containing real world examples (CRUD, auth, advanced patterns, etc) that adheres to the [RealWorld](https://github.com/gothinkster/realworld) spec and API.

This codebase was created to demonstrate a fully fledged fullstack application built with **AdonisJS 5** including CRUD operations, authentication, routing, pagination, all of this using TDD.

I've gone to great lengths to adhere to the **AdonisJS 5** community styleguides & best practices.

For more information about the API built here, head over to the [API Specs](https://realworld-docs.netlify.app/docs/specs/backend-specs/introduction) repo.

# Getting started

- Install dependencies:

```
$ yarn
```

- Create your `.env` file based on `.env.example`
- Generate an app key for adonis project:

```
$ node ace generate:key
```

- Run migrations:

```
$ node ace migration:run
```

- Run tests:

```
$ yarn test
```

- Start dev server:

```
$ yarn dev
```

For other commands, follow [AdonisJS documentation](https://adonisjs.com)
