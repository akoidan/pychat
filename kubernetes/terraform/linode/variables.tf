variable "linode_token" {}
variable "node_type" {
  default = "g6-standard-1"
}

variable "k8s_version" {
  default = "1.26"
}
variable "region" {
  default = "eu-west"
}

variable "linode_app_label" {
  default = "pychat_1"
}
