var sum_to_n_a = function (n) {
  return (n * (n + 1)) / 2;
};

var sum_to_n_b = function (n) {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
};

var sum_to_n_c = function (n) {
  if (n <= 1) return n;
  return n + sum_to_n_c(n - 1);
};

var sum_to_n_d = function (n) {
  return Array.from({ length: n }, (_, i) => i + 1).reduce(
    (acc, val) => acc + val,
    0
  );
};

console.log(sum_to_n_a(5));
console.log(sum_to_n_b(5));
console.log(sum_to_n_c(5));
console.log(sum_to_n_d(5));
