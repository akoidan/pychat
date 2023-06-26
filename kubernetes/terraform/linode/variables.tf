variable "linode_token" {}
variable "linode_app_label" {}
variable "node_count" {
  default = 1
}
variable "node_type" {
  default = "g6-standard-1"
}
variable "k8s_version" {
  default = "1.26"
}
variable "region" {
  default = "eu-west"
}
