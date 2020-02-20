# Bet365 Checker

A robot to monitor [Bet365](https://www.bet365.com/) and notify a [Telegram](https://telegram.org/) channel whenever new matches are available for specific championships previously configured.

## Installation

### Check that you have `node` and `npm` installed

To check if you have `Node.js` installed, run this command in your terminal:
```bash
node -v
```

To confirm that you have `npm` installed you can run this command in your terminal:
```bash
npm -v
```

If `Node.js` and `npm` are not installed, download and install [Node.js](https://nodejs.org/en/download/)

After confirming that you have both `Node.js` and `npm` installed, run this command in your terminal in the root folder of the project:
````bash
npm install
````

## Configuration

To determine the championships you want to follow and be notified, open the file `config/championships` and enter all championships one per each line like in this example:
```
Copa do Brasil
Brasileirão - Série A
Brasil - Campeonato Gaúcho
```

## Usage

From the root folder of the project, run this command in your terminal:
````bash
node src/soccer-checker.js
````
That is it. The robot will keep running as long as the terminal is open.

Please keep in mind that you cannot turn your computer off.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)