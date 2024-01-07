#!/bin/bash

process_name=node.exe

# Get the process ID (PID) of the specified process
pid=$(pgrep "$process_name")

if [ -z "$pid" ]; then
    echo "Process $process_name not found."
else
    # Forcefully terminate the process
    kill -9 "$pid"
    echo "Process $process_name terminated."
fi
