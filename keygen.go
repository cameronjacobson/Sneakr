// Example GO script which shows how one could generate
// compatible modulus and exponent components on the
// server-side

package main

import(
        "fmt"
        "crypto/rsa"
        "crypto/rand"
)

func main(){
        privkey,_ := rsa.GenerateKey(rand.Reader, 512)
        fmt.Println("MODULUS:",fmt.Sprintf("%x",privkey.PublicKey.N))
        fmt.Println("PUBLIC EXPONENT:",fmt.Sprintf("%x",privkey.PublicKey.E))
        fmt.Println("PRIVATE EXPONENT:",fmt.Sprintf("%x",privkey.D))
}
