# Chat Application
I'm creating a chat application using NodeJS, Express, and MongoDB (coming soon). This is a project for me to experiment with Socket.io and learn how to integrate OAuth 2.0 in a real-world-like application. This'll be hosted on Heroku/Netlify and you'll be able to DM people, create your own room and chat with others. 

This app also implements a new design trend called 'neumorphism' which is a minimal way to design with a soft, extruded plastic look.
Learn more about it [here](https://uxdesign.cc/neumorphism-can-we-make-it-more-accessible-15be5fe2ef28)!

## To-Do
- [ ] Get socket.io rooms working again (solve client-side error)
- [ ] Use MongoDB cluster online to store user login data (no chat history stored)
- [ ] Implement functionality:
    - [ ] Edit personal information (name, about section)
    - [ ] Chat with person by username (email ID) - most important
    - [ ] Rooms refresh live
- [ ] Host online:
    - [ ] How to switch socket port from localhost
    - [ ] Reorganize files into MVC framework, create separate "package" for socket.io code