// Solution 1: Mathematical Formula (n*(n+1)/2)
/*
	•	Time Complexity: O(1)
	•	Only a few arithmetic operations (multiply, add, divide).
	•	Independent of n.
		
	•	Space Complexity: O(1)
	•	Uses only constant memory for calculation.
*/
var sum_to_n_a = function (n) {
  return (n * (n + 1)) / 2;
};

// Solution 2: Iterative Loop
/*
	•	Time Complexity: O(n)
	•	Loop runs n times. Each iteration does a constant-time addition.
		
	•	Space Complexity: O(1)
	•	Uses only constant memory for calculation.
*/
var sum_to_n_b = function (n) {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
};

// Solution 3: Recursion
/*
	•	Time Complexity: O(n)
	•	Recursive calls run n times. Each call does a constant-time addition.
		
	•	Space Complexity: O(n)
	•	Each recursive call is stored on the call stack until it returns --> That’s n stack frames in memory.
*/
var sum_to_n_c = function (n) {
  if (n <= 1) return n;
  return n + sum_to_n_c(n - 1);
};

// Solution 4: ES6 Array.from + reduce
/*
	•	Time Complexity: O(n)
	•	Creates an array of size n, then reduces it with a constant-time operation.
		
	•	Space Complexity: O(n)
	•	Creates an array of size n, which takes up O(n) space.
*/
var sum_to_n_d = function (n) {
  return Array.from({ length: n }, (_, i) => i + 1).reduce(
    (acc, val) => acc + val,
    0
  );
};

/*
	1.	Formula (fastest, constant time).
	2.	Loop (classic, easy to follow).
	3.	Recursion (elegant, but stack-heavy).
	4.	Array functional style (modern, expressive).
*/

console.log(sum_to_n_a(5));
console.log(sum_to_n_b(5));
console.log(sum_to_n_c(5));
console.log(sum_to_n_d(5));
