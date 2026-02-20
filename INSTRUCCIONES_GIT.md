# 📝 Instrucciones para Subir a GitHub

## Opción 1: Crear Repositorio Nuevo en GitHub

### Paso 1: Crear repositorio en GitHub.com

1. Ir a https://github.com y loguearte
2. Click en el botón **"+"** arriba a la derecha → **"New repository"**
3. Nombre del repositorio: `dashboard-agregadurias`
4. Descripción: "Sistema de gestión de agregadurías militares"
5. Elegir **"Private"** o **"Public"** según prefieras
6. **NO marcar** "Initialize this repository with a README"
7. Click **"Create repository"**

### Paso 2: Subir el proyecto desde tu computadora

Abrir PowerShell o Git Bash en la carpeta del proyecto y ejecutar:

```bash
# Navegar a la carpeta del proyecto (si no estás ahí)
cd G:\Downloads\dashboard-agregadurias

# Inicializar Git
git init

# Agregar todos los archivos
git add .

# Hacer el primer commit
git commit -m "Initial commit - Dashboard de Agregadurías"

# Conectar con tu repositorio de GitHub (reemplazar con tu usuario)
git remote add origin https://github.com/TU-USUARIO/dashboard-agregadurias.git

# Subir los archivos
git push -u origin main
```

⚠️ **Importante:** Reemplazar `TU-USUARIO` con tu nombre de usuario de GitHub.

---

## Opción 2: Usar GitHub Desktop (Más fácil)

### Paso 1: Descargar GitHub Desktop

1. Ir a https://desktop.github.com/
2. Descargar e instalar
3. Loguearte con tu cuenta de GitHub

### Paso 2: Publicar el proyecto

1. Abrir GitHub Desktop
2. File → **"Add Local Repository"**
3. Seleccionar la carpeta: `G:\Downloads\dashboard-agregadurias`
4. Si dice que no es un repositorio, click en **"Create a repository"**
5. Click en **"Publish repository"** arriba a la derecha
6. Elegir nombre y si será público o privado
7. Click **"Publish Repository"**

¡Listo! Ya está en GitHub.

---

## 🌐 Abrir el Proyecto en Otro Lugar

### En otra computadora:

```bash
# Clonar el repositorio
git clone https://github.com/TU-USUARIO/dashboard-agregadurias.git

# Entrar a la carpeta
cd dashboard-agregadurias

# Instalar dependencias
npm install

# Ejecutar
npm run dev
```

### Compartir sin Git:

#### Opción A: Comprimir carpeta
1. Ir a `G:\Downloads\`
2. Click derecho en `dashboard-agregadurias`
3. **"Enviar a"** → **"Carpeta comprimida"**
4. Compartir el archivo `.zip`

**⚠️ Importante:** La carpeta `node_modules` es muy grande. Antes de comprimir, podés borrarla. La persona que reciba el proyecto solo necesita ejecutar `npm install` para regenerarla.

#### Opción B: Google Drive / OneDrive

1. Borrar la carpeta `node_modules` (se regenera con `npm install`)
2. Subir la carpeta completa a Drive/OneDrive
3. Compartir el link

---

## 🚀 Deploy Online (Gratis)

### Netlify (Recomendado)

1. Ir a https://www.netlify.com/
2. Sign up con GitHub
3. Click **"Add new site"** → **"Import an existing project"**
4. Conectar tu repositorio de GitHub
5. Build command: `npm run build`
6. Publish directory: `dist`
7. Click **"Deploy site"**

Te dará una URL tipo: `https://tu-sitio.netlify.app`

### Vercel

Similar a Netlify:
1. Ir a https://vercel.com/
2. Sign up con GitHub
3. **"New Project"** → Importar tu repositorio
4. Click **"Deploy"**

### GitHub Pages

```bash
# Instalar gh-pages
npm install --save-dev gh-pages

# Agregar a package.json bajo "scripts":
"predeploy": "npm run build",
"deploy": "gh-pages -d dist"

# Luego ejecutar:
npm run deploy
```

Tu sitio estará en: `https://TU-USUARIO.github.io/dashboard-agregadurias/`

---

## 🔄 Actualizar el Repositorio

Cuando hagas cambios:

```bash
git add .
git commit -m "Descripción de los cambios"
git push
```

---

## ❓ Problemas Comunes

### "git not found"
- Instalar Git desde: https://git-scm.com/download/win

### Error de autenticación
- Usar GitHub Desktop en lugar de línea de comandos
- O configurar SSH keys: https://docs.github.com/es/authentication/connecting-to-github-with-ssh

### node_modules muy grande
- Esto es normal, nunca subir `node_modules` a Git
- El archivo `.gitignore` ya lo excluye automáticamente

---

## 📞 Ayuda Adicional

- **Documentación Git:** https://git-scm.com/doc
- **GitHub Guides:** https://guides.github.com/
- **Netlify Docs:** https://docs.netlify.com/
