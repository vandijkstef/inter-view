
![Logo of the project](./doc/github-icon.png)
# Inter-view
> Documentation is found in the `/docs` folder
Inter-view is a browser tool that enables you to audio record (semi-)structured interviews in intervals. It requires a Node.JS back-end to set up, but is able to function offline afterwards using a serviceworker.
<!-- Add a nice image here at the end of the week, showing off your shiny frontend 📸 -->

<!-- Maybe a table of contents here? 📚 -->

## Getting started
These instructions will tell you how to get going with this project.

### Setup local SSL
```
openssl req -x509 -out localhost.crt -keyout localhost.key \ -newkey rsa:2048 -nodes -sha256 \ -subj '/CN=localhost' -extensions EXT -config <( \ printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")
```

### Prerequisites
Let's write something about server and/or client prerequites.

### Code style
A note about code style, though this might fit better somewhere else

### Installation and running
The basic way to run the project.

### Deployment
Something about deploying

## Contributing
Currently, no contributions are accepted. However, you are free to fork the project and build on it.

## Licence
<!-- How about a license here?  (or is it a licence?) 🤷 -->

## Acknowledgments
* ☕️️️️
