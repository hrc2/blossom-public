#!/usr/bin/env bash
ifconfig | grep "inet " | grep -Fv 127.0.0.1 | awk '{print $2}' > ip_addr.txt
