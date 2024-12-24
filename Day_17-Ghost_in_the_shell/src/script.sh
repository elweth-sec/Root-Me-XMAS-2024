#!/bin/bash

random_name=$(openssl rand -base64 12 | tr -d '/+' | tr -d '=')
cat > "/home/user/tmp/$random_name.gs"

gs -sDEVICE=pdfwrite -dNOPAUSE -dBATCH -o "/home/user/tmp/$random_name.pdf" "/home/user/tmp/$random_name.gs"

if [[ $? -ne 0 ]]; then
    echo "Erreur lors de la conversion en PDF."
    exit 1
fi

base64_output=$(base64 "/home/user/tmp/$random_name.pdf" -w0)
echo "Your PDF in base64 is, decode it and enjoy your creation!"
echo "$base64_output"