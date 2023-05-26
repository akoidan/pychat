variable "linode_token" {}
variable "pools" {
  description = "The Node Pool specifications for the Kubernetes cluster. (required)"
  type = list(object({
    type = string
    count = number
  }))
  default = [
    {
      type = "g6-standard-1"
      count = 1
    }
  ]
}

variable "k8s_version" {
  default = "1.27"
}
variable "region" {
  default = "eu-west"
}
