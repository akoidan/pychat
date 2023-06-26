variable "cloud_flare_api_token" {
  sensitive = true
}
variable "kubeconfig" {
  sensitive = true
}
variable "tls_crt" {
  default   = null
  sensitive = true
}
variable "tls_key" {
  default = null
}
variable "docker_domain_name" {}
variable "static_domain_name" {}
variable "domain_name" {}
variable "email" {}
variable "github" {}
variable "id_rsa" {
  sensitive = true
}
variable "id_rsa_pub" {}
variable "ip_address" {}
variable "SECRET_KEY" {
  sensitive = true
}
variable "RECAPTCHA_PRIVATE_KEY" {
  sensitive = true
}
variable "GOOGLE_OAUTH_2_CLIENT_ID" {
  sensitive = true
}
variable "FACEBOOK_ACCESS_TOKEN" {
  sensitive = true
}
variable "FIREBASE_API_KEY" {
  sensitive = true
}
variable "DEFAULT_PROFILE_ID" {}
variable "htpasswd" {
  default   = null
  sensitive = true
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

variable "SHOW_COUNTRY_CODE" {
  default = "true"
}

locals {
  SERVER_EMAIL = "root@${var.domain_name}"
}
