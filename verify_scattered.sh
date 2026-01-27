#!/bin/sh
echo "Scattered Projects Verification"
echo "==============================="

# Define project paths (UPDATE THESE PATHS!)
FRONTEND_DIR="$HOME/myapp_new"
BACKEND_DIR="$HOME/nba-backend"
ANALYTICS_BACKEND_DIR="$HOME/sports-analytics-backend"
ANALYTICS_DASHBOARD_DIR="$HOME/sports-analytics-dashboard"

echo "Checking scattered projects..."
echo ""

check_project() {
    PROJECT_NAME="$1"
    PROJECT_PATH="$2"
    
    echo "=== $PROJECT_NAME ==="
    if [ -d "$PROJECT_PATH" ]; then
        echo "Location: $PROJECT_PATH"
        echo "Status: OK - Directory exists"
        
        # Check for project files
        if [ -f "$PROJECT_PATH/package.json" ] || [ -f "$PROJECT_PATH/requirements.txt" ] || [ -f "$PROJECT_PATH/pom.xml" ] || [ -f "$PROJECT_PATH/go.mod" ]; then
            echo "Type: Project files found"
        else
            echo "Type: No project files detected"
        fi
        
        # Count files
        FILE_COUNT=$(find "$PROJECT_PATH" -type f -name "*.js" -o -name "*.py" -o -name "*.java" -o -name "*.go" 2>/dev/null | wc -l | tr -d ' ')
        echo "Files: Approximately $FILE_COUNT source files"
        
    else
        echo "Location: $PROJECT_PATH"
        echo "Status: ERROR - Directory not found!"
    fi
    echo ""
}

check_project "Frontend (myapp_new)" "$FRONTEND_DIR"
check_project "Main Backend (nba-backend)" "$BACKEND_DIR"
check_project "Analytics Backend" "$ANALYTICS_BACKEND_DIR"
check_project "Analytics Dashboard" "$ANALYTICS_DASHBOARD_DIR"

echo "==============================="
echo "Note: Projects are scattered in home directory."
echo "For better organization, consider moving all projects"
echo "to a single parent directory."
