function test() {
try {
    throw "error"; // this is not executed, control goes to finally
  } catch {
    console.log("catch");
    return 1;
  } finally {
    console.log("finally");
    return 1000;
  }
}
console.log(test()); // finally 1
