FROM debian:bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssh-server sudo man bash locales manpages manpages-dev && \
    rm -rf /var/lib/apt/lists/*

RUN useradd -m sshuser && echo 'sshuser:password' | chpasswd

RUN locale-gen en_US.UTF-8

ENV LANG=en_US.UTF-8
ENV LC_ALL=en_US.UTF-8

COPY dev.sh /usr/bin/dev.sh
RUN chmod 700 /usr/bin/dev.sh && \
    chown root:root /usr/bin/dev.sh

RUN echo "RM{S4NTA_IS_N0T_4DMIN_SYS}" > /root/flag-1a0a6a36ca0a3953b997ddaeb722cb31e9e421b038f6a67ef55593f21dcf92b1.txt && \
    chmod 600 /root/flag-1a0a6a36ca0a3953b997ddaeb722cb31e9e421b038f6a67ef55593f21dcf92b1.txt && \
    chown root:root /root/flag-1a0a6a36ca0a3953b997ddaeb722cb31e9e421b038f6a67ef55593f21dcf92b1.txt

RUN echo "sshuser ALL=(ALL) NOPASSWD: /bin/date *, !/bin/date *-f*, !/bin/date *--file*" > /etc/sudoers.d/sshuser && \
    echo "sshuser ALL=(ALL) NOPASSWD: /usr/bin/dev.sh" >> /etc/sudoers.d/sshuser && \
    chmod 440 /etc/sudoers.d/sshuser

RUN echo "Defaults:ALL !requiretty" >> /etc/sudoers && \
    sed -i '/^%sudo/d' /etc/sudoers

RUN mkdir /var/run/sshd && \
    sed -i 's@^#PermitRootLogin prohibit-password@PermitRootLogin no@g' /etc/ssh/sshd_config && \
    sed -i 's@^#PasswordAuthentication yes@PasswordAuthentication yes@g' /etc/ssh/sshd_config

RUN apt-get purge -y --auto-remove && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

EXPOSE 22

CMD ["/usr/sbin/sshd", "-D"]