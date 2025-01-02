#!/bin/bash

# Mostrar información de Git
mostrar_informacion_git() {
  echo "---------------------------------------------------"
  echo "Rama actual: $(git branch --show-current)"
  echo "Usuario de Git: $(git config --global user.name)"
  echo "Correo de Git: $(git config --global user.email)"
  echo "---------------------------------------------------"
}

# Confirmar rama y usuario
confirmar_rama_y_usuario() {
  echo "---------------------------------------------------"
  echo "Estás en la rama: $(git branch --show-current)"
  usuario_actual=$(git config --global user.name)
  correo_actual=$(git config --global user.email)
  echo "¿Deseas continuar en la rama '$(git branch --show-current)' y usuario '$usuario_actual'? (s/n):"
  read -p "Respuesta: " continuar_rama_usuario

  if [[ "$continuar_rama_usuario" == "n" || "$continuar_rama_usuario" == "N" ]]; then
    echo "Ramas disponibles:"
    ramas=($(git branch -a | sed 's/^[* ]*//'))
    for i in "${!ramas[@]}"; do
      echo "$((i + 1))) ${ramas[$i]}"
    done

    read -p "Seleccione el número de la rama a la que desea cambiar: " seleccion
    if [[ "$seleccion" =~ ^[0-9]+$ ]] && [ "$seleccion" -le "${#ramas[@]}" ]; then
      rama_seleccionada="${ramas[$((seleccion - 1))]}"
      git checkout "${rama_seleccionada#remotes/origin/}" 2>/dev/null || {
        echo "Error: No se pudo cambiar a la rama '${rama_seleccionada}'. Verifique el nombre.";
        return 1;
      }
      echo "Cambiado a la rama: $rama_seleccionada"
    else
      echo "Selección no válida. Manteniéndose en la rama actual."
    fi
  fi

  # Confirmar usuario
  usuario_actual=$(git config --global user.name)
  correo_actual=$(git config --global user.email)

  echo "Usuario actual de Git: $usuario_actual"
  echo "Correo actual de Git: $correo_actual"

  read -p "¿Deseas cambiar el usuario? (s/n): " cambiar_usuario
  if [[ "$cambiar_usuario" == "s" || "$cambiar_usuario" == "S" ]]; then
    read -p "Ingrese el nuevo nombre de usuario de Git: " nuevo_usuario
    read -p "Ingrese el nuevo correo de Git: " nuevo_correo
    git config --global user.name "$nuevo_usuario"
    git config --global user.email "$nuevo_correo"
    echo "Usuario actualizado: $(git config --global user.name)"
    echo "Correo actualizado: $(git config --global user.email)"
  fi
}

# Comprobar si el archivo .gitignore existe
crear_o_actualizar_gitignore() {
  if [ ! -f .gitignore ]; then
    echo ".gitignore no encontrado, creando archivo..."
    touch .gitignore
    echo "Archivo .gitignore creado."
  fi

  # Verificar si el archivo a ignorar ya está en .gitignore
  archivo_a_ignorar="commits.sh"
  if ! grep -q "$archivo_a_ignorar" .gitignore; then
    echo "$archivo_a_ignorar" >> .gitignore
    echo "$archivo_a_ignorar agregado al .gitignore."
  else
    echo "$archivo_a_ignorar ya está en el .gitignore."
  fi
}

# Función para realizar git pull
manejar_pull_con_divergencia() {
  echo "---------------------------------------------------"
  echo "Estás en la rama: $(git branch --show-current)"
  read -p "¿Deseas hacer un git pull en esta rama? (s/n): " continuar_pull

  if [[ "$continuar_pull" == "s" || "$continuar_pull" == "S" ]]; then
    echo "Opciones para resolver divergencias:"
    echo "1) git pull --rebase (Rebase)"
    echo "2) git pull --no-rebase (Merge)"
    echo "3) git pull --ff-only (normal)"
    read -p "Selecciona una opción para continuar: " opcion_pull

    case $opcion_pull in
      1)
        git config pull.rebase true
        git pull
        ;;
      2)
        git config pull.rebase false
        git pull
        ;;
      3)
        git config pull.ff only
        git pull
        ;;
      *)
        echo "Opción no válida. Regresando al menú."
        ;;
    esac
  else
    echo "Operación cancelada. Regresando al menú."
  fi
}

# Deshacer el pull y volver a la versión local
deshacer_pull() {
  echo "---------------------------------------------------"
  echo "¿Deseas deshacer los cambios traídos con el git pull?"
  read -p "Esta acción restablecerá tu rama local al estado anterior al git pull. (s/n): " continuar_deshacer

  if [[ "$continuar_deshacer" == "s" || "$continuar_deshacer" == "S" ]]; then
    echo "Deshaciendo cambios..."
    git reset --hard HEAD@{1}  # Esto regresa la rama al estado antes del pull
    echo "Cambios deshechos. Volviendo a la versión local."
  else
    echo "Operación cancelada. Regresando al menú."
  fi
}

# Commit específico
commit_especifico() {
  read -p "Ingrese el mensaje del commit: " mensaje_commit
  echo "Realizando commit con el mensaje: '$mensaje_commit'"
  git add .
  git commit -m "$mensaje_commit"
  read -p "¿Deseas hacer push de este commit? (s/n): " continuar_push
  if [[ "$continuar_push" == "s" || "$continuar_push" == "S" ]]; then
    git push
  else
    echo "Commit realizado sin push."
  fi
}

# Commit automático
commit_automatico() {
  echo "Realizando commit automático..."
  git add .
  git commit -m "Commit automático"
  read -p "¿Deseas hacer push de este commit? (s/n): " continuar_push
  if [[ "$continuar_push" == "s" || "$continuar_push" == "S" ]]; then
    git push
  else
    echo "Commit automático realizado sin push."
  fi
}

# Función para listar ramas y hacer push
git_push() {
  echo "---------------------------------------------------"
  echo "Estás en la rama: $(git branch --show-current)"
  ramas=($(git branch -a | sed 's/^[* ]*//'))
  echo "Ramas disponibles para hacer push:"
  for i in "${!ramas[@]}"; do
    echo "$((i + 1))) ${ramas[$i]}"
  done

  read -p "Seleccione la rama a la que desea hacer push: " seleccion
  if [[ "$seleccion" =~ ^[0-9]+$ ]] && [ "$seleccion" -le "${#ramas[@]}" ]; then
    rama_seleccionada="${ramas[$((seleccion - 1))]}"
    git push origin "${rama_seleccionada#remotes/origin/}"
  else
    echo "Selección no válida. Regresando al menú."
  fi
}

# Acciones del proyecto
acciones_proyecto() {
  echo "---------------------------------------------------"
  echo "Estás en la rama: $(git branch --show-current)"
  echo "Usuario actual de Git: $(git config --global user.name)"
  read -p "¿Deseas continuar con estas configuraciones? (s/n): " continuar_accion

  if [[ "$continuar_accion" == "s" || "$continuar_accion" == "S" ]]; then
    echo "Opciones disponibles:"
    echo "1) git pull"
    echo "2) git push"
    echo "3) git status"
    echo "4) git log"
    echo "5) Deshacer pull"
    read -p "Seleccione una acción (1-5): " accion

    case $accion in
      1)
        manejar_pull_con_divergencia
        ;;
      2)
        git_push
        ;;
      3)
        git status
        ;;
      4)
        git log --oneline
        ;;
      5)
        deshacer_pull
        ;;
      *)
        echo "Opción no válida."
        ;;
    esac
  else
    echo "Operación cancelada. Regresando al menú."
  fi
}

# Menú principal
while true; do
  mostrar_informacion_git
  crear_o_actualizar_gitignore  # Verificar si .gitignore existe y agregar archivo si es necesario
  echo "Seleccione una opción:"
  echo "1) Crear commits automáticos"
  echo "2) Crear un commit específico"
  echo "3) Cambiar rama y verificar usuario"
  echo "4) Acciones del proyecto"
  echo "5) Salir"
  read -p "Opción (1-5): " opcion

  case $opcion in
    1)
      commit_automatico
      ;;
    2)
      commit_especifico
      ;;
    3)
      confirmar_rama_y_usuario
      ;;
    4)
      acciones_proyecto
      ;;
    5)
      echo "Saliendo..."
      exit 0
      ;;
    *)
      echo "Opción no válida."
      ;;
  esac
done
