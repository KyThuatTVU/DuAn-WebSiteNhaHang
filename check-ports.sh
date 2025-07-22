#!/bin/bash

echo "🔌 Port Status Checker"
echo "====================="

# Function to check specific port
check_port() {
    local port=$1
    local service=$2
    
    echo "🔍 Checking port $port ($service):"
    echo "=================================="
    
    # Check if port is in use
    if netstat -ano | findstr ":$port " > /dev/null 2>&1; then
        echo "❌ Port $port is IN USE"
        
        # Get process info
        echo "📋 Process details:"
        netstat -ano | findstr ":$port " | head -5
        
        # Try to get process name
        echo ""
        echo "📋 Process names:"
        for pid in $(netstat -ano | findstr ":$port " | awk '{print $5}' | sort -u); do
            if [ "$pid" != "PID" ] && [ -n "$pid" ]; then
                echo "  PID $pid: $(tasklist /fi "pid eq $pid" /fo csv | tail -1 | cut -d',' -f1 | tr -d '"' 2>/dev/null || echo 'Unknown')"
            fi
        done
        
        return 1
    else
        echo "✅ Port $port is AVAILABLE"
        return 0
    fi
    echo ""
}

# Function to check all important ports
check_all_ports() {
    echo "🔍 Checking All Important Ports:"
    echo "================================"
    
    ports=(
        "80:HTTP/Frontend"
        "3000:Backend API"
        "3306:MySQL Local"
        "3307:MySQL Docker"
        "443:HTTPS"
        "8080:Alternative HTTP"
    )
    
    for port_info in "${ports[@]}"; do
        port=$(echo $port_info | cut -d':' -f1)
        service=$(echo $port_info | cut -d':' -f2)
        check_port $port "$service"
        echo ""
    done
}

# Function to show MySQL specific info
check_mysql_ports() {
    echo "🗄️  MySQL Port Analysis:"
    echo "========================"
    
    # Check port 3306
    echo "🔍 Port 3306 (Standard MySQL):"
    if netstat -ano | findstr ":3306 " > /dev/null 2>&1; then
        echo "❌ Port 3306 is occupied"
        
        # Check if it's MySQL
        mysql_pids=$(netstat -ano | findstr ":3306 " | awk '{print $5}' | sort -u)
        for pid in $mysql_pids; do
            if [ "$pid" != "PID" ] && [ -n "$pid" ]; then
                process_name=$(tasklist /fi "pid eq $pid" /fo csv 2>/dev/null | tail -1 | cut -d',' -f1 | tr -d '"')
                echo "  PID $pid: $process_name"
                
                if echo "$process_name" | grep -i mysql > /dev/null; then
                    echo "  ✅ This is MySQL service"
                elif echo "$process_name" | grep -i mariadb > /dev/null; then
                    echo "  ✅ This is MariaDB service"
                else
                    echo "  ⚠️  This is NOT a MySQL service"
                fi
            fi
        done
        
        echo ""
        echo "💡 Recommendation: Use port 3307 for Docker MySQL"
        
    else
        echo "✅ Port 3306 is available"
        echo "💡 You can use either 3306 or 3307 for Docker MySQL"
    fi
    
    echo ""
    
    # Check port 3307
    echo "🔍 Port 3307 (Docker MySQL):"
    if netstat -ano | findstr ":3307 " > /dev/null 2>&1; then
        echo "❌ Port 3307 is occupied"
        
        # Check if it's Docker MySQL
        docker_pids=$(netstat -ano | findstr ":3307 " | awk '{print $5}' | sort -u)
        for pid in $docker_pids; do
            if [ "$pid" != "PID" ] && [ -n "$pid" ]; then
                process_name=$(tasklist /fi "pid eq $pid" /fo csv 2>/dev/null | tail -1 | cut -d',' -f1 | tr -d '"')
                echo "  PID $pid: $process_name"
                
                if echo "$process_name" | grep -i docker > /dev/null; then
                    echo "  ✅ This is Docker process"
                fi
            fi
        done
    else
        echo "✅ Port 3307 is available for Docker MySQL"
    fi
}

# Function to suggest solutions
suggest_solutions() {
    echo ""
    echo "🔧 Suggested Solutions:"
    echo "======================"
    
    # Check if 3306 is used
    if netstat -ano | findstr ":3306 " > /dev/null 2>&1; then
        echo "📋 Port 3306 is in use:"
        echo "  Option 1: Use Docker MySQL on port 3307 (Recommended)"
        echo "    docker-compose -f docker-compose.simple.yml up -d"
        echo ""
        echo "  Option 2: Stop local MySQL temporarily"
        echo "    net stop MySQL"
        echo "    net stop MySQL80"
        echo "    # Then use port 3306 for Docker"
        echo ""
        echo "  Option 3: Use different port (e.g., 3308)"
        echo "    # Edit docker-compose file to use 3308:3306"
    else
        echo "✅ Port 3306 is available - you can use it for Docker MySQL"
    fi
    
    echo ""
    echo "🐳 Docker Commands:"
    echo "  # Use port 3307 (safe option):"
    echo "  docker-compose -f docker-compose.simple.yml up -d"
    echo ""
    echo "  # Check Docker containers:"
    echo "  docker-compose -f docker-compose.simple.yml ps"
    echo ""
    echo "  # Check Docker logs:"
    echo "  docker-compose -f docker-compose.simple.yml logs mysql"
}

# Function to kill process on specific port
kill_port_process() {
    local port=$1
    
    if [ -z "$port" ]; then
        echo "Usage: kill_port_process <port>"
        return 1
    fi
    
    echo "🛑 Attempting to free port $port..."
    
    # Get PIDs using the port
    pids=$(netstat -ano | findstr ":$port " | awk '{print $5}' | sort -u)
    
    for pid in $pids; do
        if [ "$pid" != "PID" ] && [ -n "$pid" ]; then
            process_name=$(tasklist /fi "pid eq $pid" /fo csv 2>/dev/null | tail -1 | cut -d',' -f1 | tr -d '"')
            echo "Found process: $process_name (PID: $pid)"
            
            read -p "Kill process $process_name (PID: $pid)? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                if taskkill /PID $pid /F; then
                    echo "✅ Process $pid killed"
                else
                    echo "❌ Failed to kill process $pid"
                fi
            fi
        fi
    done
}

# Main execution
main() {
    case "$1" in
        "3306")
            check_port 3306 "MySQL"
            ;;
        "3307")
            check_port 3307 "Docker MySQL"
            ;;
        "mysql")
            check_mysql_ports
            ;;
        "all")
            check_all_ports
            ;;
        "kill")
            if [ -n "$2" ]; then
                kill_port_process $2
            else
                echo "Usage: $0 kill <port>"
            fi
            ;;
        "solutions")
            suggest_solutions
            ;;
        *)
            echo "Usage: $0 {3306|3307|mysql|all|kill|solutions}"
            echo ""
            echo "Commands:"
            echo "  3306      - Check port 3306 specifically"
            echo "  3307      - Check port 3307 specifically"
            echo "  mysql     - Check both MySQL ports (3306 & 3307)"
            echo "  all       - Check all important ports"
            echo "  kill <port> - Kill process using specific port"
            echo "  solutions - Show suggested solutions"
            echo ""
            echo "🎯 Quick checks:"
            echo "  ./check-ports.sh mysql     # Check MySQL ports"
            echo "  ./check-ports.sh all       # Check all ports"
            ;;
    esac
}

main "$@"
