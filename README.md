# Brainsoft BE Code Challenge solution

## How to start development server

```sh
docker compose up
```

- Wait for server links to show up, but server should run at http://localhost:3000
- Swagger UI should run at http://localhost:3000/documentation

or

```sh
yarn dev:docker or yarn dev:docker:prepare (for fresh image build)
```

## How to run tests

- First time running test run:

```sh
yarn test:docker:prepare
```

- Additional runs can be invoked by

```sh
yarn test:docker
```

## Stop running containers, delete networks and volumes

```sh
yarn dev:docker:clean
```

```sh
yarn test:docker:clean
```

## ER Diagram

![er diagram](./er_diagram.png)
