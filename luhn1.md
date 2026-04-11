# Luhn Algorithm

The Luhn algorithm (also known as the mod-10 algorithm) is a simple checksum formula used to validate identification numbers such as credit card numbers, IMEI numbers, and National Provider Identifier numbers.

## How It Works

1. Starting from the rightmost digit (the check digit), move left and double the value of every second digit.
2. If doubling a digit results in a value greater than 9, subtract 9 from the result.
3. Sum all the digits (both doubled and undoubled).
4. If the total modulo 10 is 0, the number is valid.

## Example

Validate the number `4539578763621486`:

| Digit (right to left) | Double? | Value |
|----------------------|---------|-------|
| 6                    | No      | 6     |
| 8                    | Yes     | 16 → 7 |
| 4                    | No      | 4     |
| 1                    | Yes     | 2     |
| 2                    | No      | 2     |
| 6                    | Yes     | 12 → 3 |
| 3                    | No      | 3     |
| 7                    | Yes     | 14 → 5 |
| 8                    | No      | 8     |
| 7                    | Yes     | 14 → 5 |
| 5                    | No      | 5     |
| 9                    | Yes     | 18 → 9 |
| 3                    | No      | 3     |
| 5                    | Yes     | 10 → 1 |
| 4                    | No      | 4     |

Sum = 6 + 7 + 4 + 2 + 2 + 3 + 3 + 5 + 8 + 5 + 5 + 9 + 3 + 1 + 4 = 67  
67 mod 10 = 7 → **Invalid** (would need sum divisible by 10)

## Implementation Guidelines

- The algorithm operates on the string representation of the number.
- Strip any non-digit characters (spaces, dashes) before processing.
- A single digit (0–9) is considered valid.
- Numbers with all identical digits (e.g., `0000`) are considered invalid by convention in some implementations.

## Reference

- [ISO/IEC 7812](https://www.iso.org/standard/39698.html)
- Original patent by Hans Peter Luhn (IBM, 1960)
