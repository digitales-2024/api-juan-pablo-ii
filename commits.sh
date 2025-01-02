#!/bin/bash

# Mostrar información de Git
mostrar_informacion_git() {
  echo "---------------------------------------------------"
  echo "Rama actual: $(git branch --show-current)"
  echo "Usuario de Git: $(git config --global user.name)"
  echo "Correo de Git: $(git config --global user.email)"
  echo "---------------------------------------------------"
}

# Crear commits automáticos basados en archivos modificados
crear_commits_automaticos() {
  echo "Creando commits automáticos..."
  cambios=$(git status --porcelain)

  if [ -z "$cambios" ]; then
    echo "No hay cambios para commitear."
    return
  fi

  for archivo in $(git status --porcelain | awk '{print $2}'); do
    if git diff --name-only | grep -q "$archivo"; then
      tipo="feat"
    elif git diff --cached --name-only | grep -q "$archivo"; then
      tipo="fix"
    else
      tipo="chore"
    fi
    git add "$archivo"
    git commit -m "$tipo: Actualización en $archivo"
  done

  echo "Commits automáticos creados."
}

# Crear un commit específico
crear_commit_especifico() {
  echo "Ingrese el tipo de commit (feat, fix, chore, etc.):"
  read -p "Tipo: " tipo
  read -p "Descripción del commit: " descripcion

  if [ -z "$tipo" ] || [ -z "$descripcion" ]; then
    echo "Error: Debe ingresar un tipo y una descripción."
    return
  fi

  git add .
  git commit -m "$tipo: $descripcion"
  echo "Commit realizado con éxito."
}

# Cambiar de rama, verificar usuario y actualizar ramas remotas
cambiar_rama_y_usuario() {
  # Verificar o cambiar usuario
  usuario_actual=$(git config --global user.name)
  correo_actual=$(git config --global user.email)

  echo "Usuario actual de Git: $usuario_actual"
  echo "Correo actual de Git: $correo_actual"

  read -p "¿Desea cambiar el usuario? (s/n): " cambiar_usuario
  if [[ "$cambiar_usuario" == "s" || "$cambiar_usuario" == "S" ]]; then
    read -p "Ingrese el nuevo nombre de usuario de Git: " nuevo_usuario
    read -p "Ingrese el nuevo correo de Git: " nuevo_correo
    git config --global user.name "$nuevo_usuario"
    git config --global user.email "$nuevo_correo"
    echo "Usuario actualizado: $(git config --global user.name)"
    echo "Correo actualizado: $(git config --global user.email)"
  fi

  # Actualizar ramas remotas
  echo "Actualizando ramas remotas..."
  git fetch --all

  # Listar ramas disponibles
  echo "Ramas disponibles:"
  ramas=($(git branch -a | sed 's/^[* ]*//'))
  for i in "${!ramas[@]}"; do
    echo "$((i + 1))) ${ramas[$i]}"
  done

  read -p "Seleccione el número de la rama a la que desea cambiar (o presione Enter para mantenerse en la actual): " seleccion

  if [ -n "$seleccion" ] && [[ "$seleccion" =~ ^[0-9]+$ ]] && [ "$seleccion" -le "${#ramas[@]}" ]; then
    rama_seleccionada="${ramas[$((seleccion - 1))]}"
    git checkout "${rama_seleccionada#remotes/origin/}" 2>/dev/null || {
      echo "Error: No se pudo cambiar a la rama '${rama_seleccionada}'. Verifique el nombre.";
      return;
    }
    echo "Cambiado a la rama: $rama_seleccionada"
  else
    echo "Manteniéndose en la rama actual."
  fi
}

# Menú principal
while true; do
  mostrar_informacion_git
  echo "Seleccione una opción:"
  echo "1) Crear commits automáticos"
  echo "2) Crear un commit específico"
  echo "3) Cambiar rama y verificar usuario"
  echo "4) Salir"
  read -p "Opción (1-4): " opcion

  case $opcion in
    1)
      crear_commits_automaticos
      ;;
    2)
      crear_commit_especifico
      ;;
    3)
      cambiar_rama_y_usuario
      ;;
    4)
      echo "Saliendo..."
      exit 0
      ;;
    *)
      echo "Opción no válida. Intente de nuevo."
      ;;
  esac
done
