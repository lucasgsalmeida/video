# Use uma imagem base do Node.js
FROM node:14

# Defina o diretório de trabalho no contêiner
WORKDIR /usr/src/app

# Copie o package.json e package-lock.json
COPY package*.json ./

# Instale as dependências
RUN npm install

# Copie o código da aplicação
COPY . .

# Exponha a porta que a aplicação irá rodar
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["node", "server.js"]
