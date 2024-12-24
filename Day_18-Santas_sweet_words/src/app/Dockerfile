FROM ruby:3.3

RUN useradd -m santa

WORKDIR /home/santa/app

COPY src/ .

RUN gem install sinatra rackup webrick

RUN chown -R santa:santa .

COPY flag.txt /flag-ruby-expert.txt

USER santa
EXPOSE 4567

CMD ["ruby", "app.rb"]