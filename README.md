# Ocelot
An online IDE that integrates [Stopify](https://github.com/plasma-umass/Stopify), a framework that enables users to stop long-running programs with arbitrarily deep recursion and infinite loops. It also integrates an academic sublanguage of JavaScript, _ElementaryJS_.

### Setting up

- [Node](https://nodejs.org/en/)
- [Yarn](https://www.yarnpkg.com)
- [Google Cloud SDK](https://cloud.google.com/sdk/)

Then run this in root directory:
```bash
yarn install 
cd frontend/
yarn run start
cd ../backend/
yarn run build && yarn run serve
cd ..
```
