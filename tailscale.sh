#!/usr/bin/env bash

tailscale_installed() {
  if command -v tailscale >/dev/null 2>&1; then
      return 1
  else
      return 0
  fi
}

tailscale_configured() {
    data=$(tailscale status --json)

    if grep '"BackendState": "Running"'  <<< "$data"; then
        return 1
    elif grep '"BackendState": "Stopped"' <<< "$data"; then
        return 1
    else
        return 0
    fi
}

tailscale_status() {
    data=$(tailscale status --json)

    if grep '"BackendState": "Running"' <<< "$data"; then
        return 1
    else
        return 0
    fi
}

toggle_status() {
    if tailscale_status; then
        tailscale down
        return 0
    else
        tailscale up
        return 1
    fi
    sleep 5
}