#!/bin/sh
set -e

# Función para verificar la conexión a la base de datos
check_database() {
    npx prisma db ping >/dev/null 2>&1
}

# Función para esperar que la base de datos esté lista
wait_for_database() {
    echo "🔍 Verificando conexión a la base de datos..."
    
    local retries=30
    local count=0
    
    until check_database; do
        count=$((count + 1))
        if [ $count -eq $retries ]; then
            echo "❌ Error: No se pudo conectar a la base de datos después de $retries intentos"
            exit 1
        fi
        
        echo "⏳ Esperando que la base de datos esté lista... (intento $count de $retries)"
        sleep 2
    done
    
    echo "✅ Conexión a la base de datos establecida"
}

# Función para manejar las migraciones
handle_migrations() {
    echo "🔄 Verificando estado de las migraciones..."
    
    # Verifica si hay migraciones pendientes
    if npx prisma migrate status | grep -q "pending"; then
        echo "⚠️  Se detectaron migraciones pendientes"
        
        # Intenta aplicar las migraciones
        echo "📦 Aplicando migraciones..."
        if npx prisma migrate deploy; then
            echo "✅ Migraciones aplicadas exitosamente"
        else
            echo "❌ Error al aplicar las migraciones"
            exit 1
        fi
    else
        echo "✅ Base de datos actualizada, no hay migraciones pendientes"
    fi
}

main() {
    # wait_for_database
    handle_migrations
    
    echo "🚀 Iniciando aplicación..."
    exec dumb-init node dist/main.js
}

main