<h1 align="center">🚧 Command History 🚧</h1>

```zsh
$ npm install --global command-history-cli
```

```zsh
$ ch <command> [option]
```

## Commands

| Name       | Description | Available options |
| ---------- | ----------- | ----------------- |
| `start`    |             | `-n`, `-g`        |
| `finish`   |             |                   |
| `template` |             | `-p`              |
| `list`     |             |                   |
| `history`  |             |                   |
| `current`  |             |                   |

## Options

| Long      | Short | Type    |
| --------- | ----- | ------- |
| `--name`  | `-n`  | string  |
| `--group` | `-g`  | string  |
| `--print` | `p`   | boolean |

## Examples

### Template Output

Select a template and output commands combined with `&&`.

```zsh
$ ch template -p
```

### Create templates from execution history

```zsh
$ ch start --name trpc-getting-started
$ mkdir trpc-getting-started
$ cd trpc-getting-started
$ mkdir server # 1
$ cd server
$ npm init -y
$ npm install express cors @trpc/server zod
$ npm install --save-dev typescript nodemon ts-node @types/express @types/node @types/cors
$ touch index.ts # 2
$ # ...
$ cd ..
$ npm create vite@latest client # 3
$ cd client
$ npm install
$ npm install @trpc/client @trpc/server @trpc/react-query @tanstack/react-query # 4
$ # ...
$ cd ..
$ cd server
$ npm install prisma --save-dev # 5
$ npx prisma init --datasource-provider sqlite
$ npx prisma db push
$ npx prisma studio # 6
$ ch finish
$ ch template
```

1. Select `trpc-getting-started`
2. Select multiple commands to be templated
3. Name the template

For example, if you select comments 1 through 2 in the above procedure and name it `server-setup`, you will get the following code

```zsh
$ mkdir server
$ cd server
$ npm init -y
$ npm install express cors @trpc/server zod
$ npm install --save-dev typescript nodemon ts-node @types/express @types/node @types/cors
$ touch index.ts
```
