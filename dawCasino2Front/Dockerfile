FROM nginx:alpine

# Copiar todos los archivos estáticos del frontend al directorio html de Nginx
COPY ./ /usr/share/nginx/html/

# Exponer el puerto 80 (por defecto de nginx)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
