'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2023-05-05T17:01:17.194Z',
    '2023-05-24T23:36:17.929Z',
    '2023-05-25T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'ro-RO', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2023-05-24T18:49:59.371Z',
    '2023-05-25T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

///Creating a function wich substract the days and display
const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);
  //console.log(daysPassed);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  // const day = `${date.getDate()}`.padStart(2, '0');
  // const month = `${date.getMonth() + 1}`.padStart(2, '0');
  // const year = date.getFullYear();
  // const hour = `${date.getHours()}`.padStart(2, '0');
  // const min = `${date.getMinutes()}`.padStart(2, '0');
  // const seconds = date.getSeconds();
  // return `${day}/${month}/${year}, ${hour}:${min}:${seconds}`;
  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCurrency = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]); // u use the same current index

    const displayDate = formatMovementDate(date, acc.locale); // we display the date

    const formattedMovValue = formatCurrency(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMovValue}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCurrency(
    acc.balance,
    acc.locale,
    acc.currency
  );
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCurrency(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCurrency(
    Math.abs(out),
    acc.locale,
    acc.currency
  );

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCurrency(
    interest,
    acc.locale,
    acc.currency
  );
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.floor(time / 60)).padStart(2, '0');
    const seconds = String(time % 60).padStart(2, '0');

    // In each callback call,print remaining time to UI
    labelTimer.textContent = `${min}:${seconds}`;

    // When 0 seconds, stop timer and log out User
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }
    // Decrease 1 second
    time--; // time = time -1
  };
  // set time to 2 min
  let time = 120;

  // Call time every second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};
///////////////////////////////////////
// Event handlers
let currentAccount, timer;

///FAKE ALWAYS LOGGED IN
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

///Experimenting API
const now = new Date();
const options = {
  hour: 'numeric',
  minute: 'numeric',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  weekday: 'long',
};

// const locale = navigator.language; // locale take it from user's browser
// console.log(locale);
// labelDate.textContent = new Intl.DateTimeFormat(
//   currentAccount.locale,
//   options
// ).format(now);

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    //❗/Experimenting API Creating New Date
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      // weekday: 'long',
    };

    // const locale = navigator.language; // locale take it from user's browser
    // console.log(locale);
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    //❗Creating current Date and Time
    // const now = new Date();
    // const day = `${now.getDate()}`.padStart(2, '0');
    // const month = `${now.getMonth() + 1}`.padStart(2, '0');
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, '0');
    // const min = `${now.getMinutes()}`.padStart(2, '0');
    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Update UI
    updateUI(currentAccount);
  }
  if (timer) clearInterval(timer);
  timer = startLogOutTimer();
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add Transfer Date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    // Reset timer when do transfer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Add movement

    setTimeout(function () {
      currentAccount.movements.push(amount);

      //Add Loan Date
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);

      //Reset Timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
console.log(23 === 23.0);
// Base 10 - 0 to 9. 1/10 = 0.1  3/10 = 3.333333
//Binary Base 2 - 0 1
console.log(0.1 + 0.2);
console.log(0.1 + 0.2 === 0.3);

//❗Conversion
console.log(Number('23')); // Convert a string to a number
console.log(+'23'); // type coercion (transform a string to a number);

// ❗Parsing
//parsInt() stand for integers
// Both of them they are global functions.
console.log(Number.parseInt('30px', 10)); // in order to work the string has to start with a number.
//parsInt() actualy accepts the second parameter called regex. Regex is the base of numeral sistem that we are using
//here we are using base 10 numbers(numbers from 0-9) and most of the time we are doing that.
console.log(Number.parseInt('e23', 10)); // is not a number because has to start with a number

//❗this is the method wich we should use whenever we want to read a value out of a string ,for example coming from CSS
console.log(Number.parseFloat('2.5rem')); //stand for floating numbers.Its reading the decimal from our string

//Check is value is NaN
console.log(Number.isNaN(20)); //false , check if is not a number
console.log(Number.isNaN('20'));
console.log(Number.isNaN(+'20X'));
console.log(Number.isNaN(23 / 0)); // not allowed in matematics it give us infinity

//❗There is a better method called isFinite() wich we can check if it is a number or not
// Check if Value is number
console.log(Number.isFinite(20)); // true , because its a number
console.log(Number.isFinite('20')); // false , because its not a number
console.log(Number.isFinite(+'20Rem')); // false, its not a number
console.log(Number.isFinite(23 / 0)); // false , give us infinity which is not finite.

console.log(Number.isInteger(23)); // true
console.log(Number.isInteger(23.5)); //false
console.log(Number.isInteger('23')); //false

////❗Rounding Numbers and Math

console.log(Math.sqrt(25));
console.log(25 ** (1 / 2));
console.log(8 ** (1 / 3)); // the single way to calculate the cubic root

console.log(Math.max(5, 18, 23, 11, 2)); // return the maximum value
console.log(Math.max(5, 18, '23', 11, 2)); // does coercion (transform a string in to a number) ,returns the biggest value
console.log(Math.max(5, 18, '23rem', 11, 2)); // it does not parsing. return Nan

console.log(Math.min(5, 18, 23, 11, 2)); // return the minimum value

//They are also constants on the math object or on the math namespace.
//EXAMPLE: If we want to calculate the radius of a circle with 10 pixels we can do that
console.log(Math.PI * Number.parseFloat('10px') ** 2);

//Another thing that is on the math object is the Math.random() function
console.log(Math.trunc(Math.random() * 6) + 1);

//We can generalize this formula and use it  always to generate random integers between two values.
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min) + 1) + min; // this is a function which will give us a number that's going to stay between min and max.

//❗ROUNDING
//Rounding Integers
// All methods it is doing parsing also
console.log(Math.round(23.3));
console.log(Math.round(23.9)); // rounding to the closest integer

console.log(Math.floor(23.3));
console.log(Math.floor('23.9')); // its doing pasrsing also

console.log(Math.ceil(23.3));
console.log(Math.ceil(23.9));

console.log(Math.trunc(23.3)); // rounding the numbers
console.log(Math.trunc(-23.3));
console.log(Math.floor(-23.3));

//Rounding Decimals
console.log(+(2.7).toFixed(0)); // to.Fixed will return a string not a number, and to return a number we have to add  + in front
console.log((2.7).toFixed(3)); // it will add the amount of decimals specified
console.log(+(2.345).toFixed(3));

//❗The Reminder Operator %
console.log(5 % 2); // returns the reminder of a division
console.log(5 / 2); // 5 = 2*2+1

console.log(6 % 2);
console.log(6 / 2);

console.log(8 % 3);
console.log(8 / 3); // 8 = 2 * 3 + 1

const isEven = n => n % 2 === 0; // creating a general function to check if a certain number its even or not
console.log(isEven(8));
console.log(isEven(23));
console.log(isEven(514));

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    if (i % 2 === 0) row.style.backgroundColor = 'orangered';
    if (i % 3 === 0) row.style.backgroundColor = 'purple';
  });
}); // when we want to color the each second element in the movements.row
// when we want to color the 3rd each element in the movements.row

//We can use underscore as numbers separator
const diameter = 287_460_000_000;
console.log(diameter);

const price = 435_99;
console.log(price);

console.log(Number('230_000')); // we can't use underscore on stirngs is not working . // print NaN

console.log(parseInt('230_000')); // we cant use underscore  _  with parsInt()  //print: 230
// We can't use underscore  when we want to store a number in  a string in an API
//We can't use _ when we get a number as a string from an API. Because JS will not be able to parse the number correctly out of that string.

//❗❗BigInt
//Numbers are represented internaly as 64 bits . there are exactly 64 0 or 1 to represent any given number
// from 64 bits only 53 are used.
console.log(2 ** 53 - 1); //this is the biggest Safe number in JS
console.log(Number.MAX_SAFE_INTEGER);

//To use bigger numbers then the safe number we use BigInt
console.log(455852555559595623224545625449546664664n); //n at the end transform the number in to a BigInt
console.log(BigInt(25821448655)); //the function BigInt() its working just with small numbers
// BigInt round the numbers as integers.

//Operations with numbers. all usual operators still works the same
console.log(10000n + 10000n);
console.log(236586623655458554445556n * 100000000n);

//console.log(Math.sqrt(20n)); This is not working
//❗It's not posibble to use BigInt with regular numbers
const huge = 5258846554445555554n;
const num = 23;
//console.log(huge * num);
console.log(huge * BigInt(num)); // to work we need to use the constractor function BigInt()

//Exceptions
//Logical Operators
console.log(20n > 15); // its working
console.log(20n === 20); // print false because Js when we use === does not do type coercion . This 2 values has different primitive type.
console.log(20n == 20); // It's working with == loose equal operator becuse Js does type Coercion. It will coercion 20n to a regular number.
console.log(20n == '20');

// String concatenation
console.log(huge + 'is Really Big!');

//Divisions
console.log(10n / 3n); // With division all numebrs it will be return the closest BigInt (integers)
console.log(10 / 3);

///✅❗CREATING DATES AND TIMES
// There are 4 ways to creating Dates in JS. Allof them use new Date() constructor just with different parameters

///🖍️ Create a date
//1.
/*
const now2 = new Date();
console.log(now2);

//2.
console.log(new Date('Thu May 18 2023 19:20:58 ')); //automaticaly Parse the date from a date string
console.log(new Date('December 25,2017')); // it is not a good ideea to do this because it's unreliable

// if the string was actually created by Js itself then offcourse it is pretty safe
console.log(account1.movementsDates[0]);
//this is based on a string but we can also pass in ,day,month,year,minute,second into this constructor
console.log(new Date(2037, 11, 19, 15, 23, 5)); // year,month (which is 0 based), day, hour,min,seconds
// in Js the Month is 0 based
console.log(new Date(2037, 10, 33)); //Js it will autocorrect to the next day if we input a wrong day

console.log(new Date(0)); //we can also pass into the date constructor function the amount of miliseconds passed since the begining of the Unix time which is January, 1, 1970
console.log(new Date(3 * 24 * 60 * 60 * 1000)); // this is the time stamp // now we get 3 days later of the begining of the Unix time
//This dates are another type of Object and they have their own methods just like arrays or maps or strings
// We can use this methods to get or to set components of a date.

//Working with dates
const future = new Date(2037, 10, 19, 15, 23);
console.log(future);
console.log(future.getFullYear());
console.log(future.getMonth()); // zero based
console.log(future.getDate()); //this is the day of the month
console.log(future.getDay()); // this is the day of the week. 0 is Sunday
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.getSeconds());
console.log(future.toISOString()); // we can get a nicely formated string, ISO folow some international standards
// Its useful when we want to convert a particular date object into a string that you can store somewhere

console.log(future.getTime()); //we can get the timestamp. which is the miliseconds wich has pass since January 1 1970
console.log(new Date(2142253380000)); //we can take this number and reverse this. Basicaly we can create a new date based on these miliseconds, and it will give us exactly the same time;
//❗ timestamps are very important ,that there is a special method that we can use to get the timestamp for right now
console.log(Date.now());
console.log(new Date(1684526662812));

//❗ They are also set version of all this methods
future.setFullYear(2040);
console.log(future);
*/
const future = new Date(2037, 10, 19, 15, 23);
console.log(+future); // converting in Number : print: timestamp in miliseconds

const calcDaysPassed = (date1, date2) =>
  Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24)); // Creating a general function wich calculate days passed

const days1 = calcDaysPassed(
  new Date(2037, 3, 4),
  new Date(2037, 3, 14, 10, 8)
);
console.log(days1);

//❗🖍️Internationalizing Numbers
const numb = 3887645.25;

const optionsStyle = {
  style: 'currency',
  unit: 'celsius',
  currency: 'EUR',
};
console.log('US:', new Intl.NumberFormat('en-US', optionsStyle).format(numb));
console.log('DE:', new Intl.NumberFormat('de-DE', optionsStyle).format(numb));
console.log(
  navigator.language,
  new Intl.NumberFormat(navigator.language, optionsStyle).format(numb)
);
console.log('RO:', new Intl.NumberFormat('ro-RO', optionsStyle).format(numb));

///❗🖍️SET TIMEOUT AND SET INTERVAL

// setTimeout = schedule a function to run after a certain amount of time,but the callback function its only executed once
//✍️  Asynchronus JS

const ingredients = ['olives', 'spinach', 'bellpeper'];
const pizzaTimer = setTimeout(
  (ing1, ing2, ing3) =>
    console.log(`Here is Your Pizza with ${ing1} ,${ing2} and ${ing3}`),
  3000,
  ...ingredients
); // second argument call the function
//console.log('Waiting...');

if (ingredients.includes('spinach')) clearTimeout(pizzaTimer);

//✍️/ setInterval()

// setInterval(function () {
//   const date = new Date();
//   const hours = date.getHours();
//   const minutes = `${date.getMinutes()}`.padStart(2, '0');
//   const seconds = `${date.getSeconds()}`.padStart(2, '0');
//   const time = `${hours}:${minutes}:${seconds}`;
//   console.log(time);
// }, 3000);

// function displayTime() {
//   let date = new Date();
//   let hours = date.getHours();
//   let minutes = date.getMinutes();
//   let seconds = date.getSeconds();
//   let time = hours + ':' + minutes + ':' + seconds;
//   console.log(time);
//   document.body.innerHTML = time;
// }
// setInterval(displayTime, 1000);
