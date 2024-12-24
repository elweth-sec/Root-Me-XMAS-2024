#!/bin/bash

# Check if the --debugmyscript argument is present
if [[ "$1" != "--debugmyscript" ]]; then
    exit 0  # Exit silently if the --debugmyscript argument is not provided
fi

# Remove --debugmyscript from the argument list
shift

echo "Welcome to the dev.sh script!"

# Function to display help
function show_help {
    echo "Usage: $0 [options]"
    echo
    echo "Options:"
    echo "  -l            List all running processes."
    echo "  -d            Show available disk space."
    echo "  -m            Show the manual for the printf command."
    echo "  -h            Show this help message."
}

# Check if no arguments are provided after --debugmyscript
if [ $# -eq 0 ]; then
    echo "Error: No arguments provided."
    show_help
    exit 1
fi

# Process arguments
while getopts "ldmh" opt; do
    case $opt in
        l)
            echo "Listing running processes:"
            ps aux
            ;;
        d)
            echo "Displaying available disk space:"
            df -h
            ;;
        m)
            echo "Displaying the manual for printf:"
            man printf
            ;;
        h)
            show_help
            ;;
        *)
            echo "Invalid option."
            show_help
            exit 1
            ;;
    esac
done
