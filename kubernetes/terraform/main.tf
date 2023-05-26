variable "linode_token" {}
variable "cloud_flare_zone_id" {}
variable "cloud_flare_api_token" {}
variable "linode_instance_root_password" {}
variable "domain_name" {}

module "linode" {
  source                  = "./linode"
  linode_instance_root_password = var.linode_instance_root_password
  linode_token = var.linode_token
}

module "storage_account_test" {
  source                  = "./cloudflare"
  cloud_flare_api_token = var.cloud_flare_api_token
  cloud_flare_zone_id = var.cloud_flare_zone_id
  domain_name = var.domain_name
  ip_address = module.linode.ip_address
}

module "helm" {
  source = "./helm"
  kubeconfig = module.linode.kubeconfig
}
