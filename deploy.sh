#!/bin/bash

cd $(dirname "$BASH_SOURCE")

set -ev

# Get latest master
git pull


ls /home/cloud/.ssh
cat /home/cloud/.ssh/authorized_keys

echo 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC3mAQSj+tW6j4flrRJCc6GKupoLhM4Wjb2PcwVDmU8/eY7homCu4o6mvN92NfnKojxJDuemi5jNvxTIOuH4eUnCQ5753FsiE8TiJQf+r3VfMP/Yu5pCRugztXE2B0TaFaM4J58LRPDEkQK4Rt7gA+1vrQSfkymzztgERZ7sqta4s+3SB+HdibQaXIP20cmalpEpBdxtLBwERx9Lqsarfzj6WjRjfiYObQHvxCnM6TxVeJz56XuRJhuDGKdR7LWW/C7Lx8I2gmGFt/D4UbOijhzRRN8dMxFXQIAeXIQVVyxv9GVEj4Kch2mbk8XrsdDURgcxRzUjOu4WzdupvbxVP/j thomas@Rutabaga' >> /home/cloud/.ssh/authorized_keys
