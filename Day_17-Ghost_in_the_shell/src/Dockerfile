FROM debian:bullseye-slim

RUN apt-get update && apt-get install -y \
    bash \
    socat \
    ghostscript \
    openssl \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -m -s /bin/bash user

COPY script.sh /usr/local/bin/script.sh
RUN chmod +x /usr/local/bin/script.sh

COPY flag.txt /tmp/flag-9fb215456edeadc855c755846be83cc310a5d262aa5d9360dd27db9cd0141a9d.txt
RUN chown root:root /tmp/flag-*
RUN mkdir -p /home/user/tmp && chown user:user /home/user/tmp

USER user
WORKDIR /home/user

EXPOSE 12345

CMD socat TCP-LISTEN:12345,fork EXEC:/usr/local/bin/script.sh
