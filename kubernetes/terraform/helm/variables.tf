variable "cloud_flare_api_token" {}
variable "kubeconfig" {}
variable "tls_crt" {
  default = null
}
variable "tls_key" {
  default = null
}
variable "docker_domain_name" {}
variable "static_domain_name" {}
variable "domain_name" {}
variable "email" {}
variable "github" {}
variable "id_rsa" {}
variable "id_rsa_pub" {}
variable "ip_address" {}
variable "SECRET_KEY" {}
variable "RECAPTCHA_PRIVATE_KEY" {}
variable "GOOGLE_OAUTH_2_CLIENT_ID" {}
variable "FACEBOOK_ACCESS_TOKEN" {}
variable "FIREBASE_API_KEY" {}
variable "DEFAULT_PROFILE_ID" {}
variable "htpasswd" {
  default = null
}
variable "use_certmanager" {
  default = true
}
variable "udp_port_range_start" {
  default = 49152
}
variable "udp_port_range_end" {
  default = 49352
}
variable "coturn_username" {
  default = "pychat"
}
variable "coturn_password" {
  default = "pypass"
}
variable "mysql_password" {
  default = "pypass"
}
variable "mysql_database_name" {
  default = "pychat"
}
variable "mysql_user" {
  default = "pychat"
}
