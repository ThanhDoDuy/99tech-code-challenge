// Since n can be any integer, including negative values,
// we can consider three different approaches:
//
// Method 1: Mathematical formula
// Method 2: Iterative loop
// Method 3: Recursion toward 0

// Method 1: Mathematical (Gauss) formula
// - For n >= 0: n * (n + 1) / 2
// - For n <  0: n * (1 - n) / 2  (sum of -1..n)
export const sumToNA = (n) => {
    // solution A
    if (n >= 0) {
        return (n * (n + 1)) / 2;
    }

    return (n * (1 - n)) / 2;
};

// Method 2: Iterative loop
export const sumToNB = (n) => {
    // solution B
    let sum = 0;
    // loop based on conditions due to N can be negative
    // if n positive
    if (n >= 0) {
        for (let i = 1; i <= n; i++) {
            sum += i;
        }
        return sum;
    }
    // if n negative
    for (let i = -1; i >= n; i--) {
        sum += i;
    }

    return sum;
};

// Method 3: Recursively move n toward 0
// - If n > 0, call with n - 1
// - If n < 0, call with n + 1
// - Stop when n === 0
export const sumToNC = (n) => {
    // solution C
    // setup break point
    if (n === 0) return 0;
    if (n > 0) {
        return n + sumToNC(n - 1); // until reach 0
    }

    return n + sumToNC(n + 1); // until reach 0
};
