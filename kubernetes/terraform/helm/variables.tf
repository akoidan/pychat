variable "domain_name" {}
variable "email" {}
variable "github" {}
variable "id_rsa" {}
variable "id_rsa_pub" {}
variable "ip_address" {}
variable "SECRET_KEY" {}
variable "RECAPTCHA_PRIVATE_KEY" {}
variable "RECAPTCHA_PUBLIC_KEY" {}
variable "GOOGLE_OAUTH_2_CLIENT_ID" {}
variable "FACEBOOK_ACCESS_TOKEN" {}
variable "GIPHY_API_KEY" {}
variable "FIREBASE_API_KEY" {}
variable "DEFAULT_PROFILE_ID" {}
variable "kubeconfig" {}
variable "tls_crt" {}
variable "tls_key" {}
variable "cloud_flare_api_token" {}
variable "mysql_password" {
  default = "pypass"
}
variable "mysql_database_name" {
  default = "pychat"
}
variable "mysql_user" {
  default = "pychat"
}
