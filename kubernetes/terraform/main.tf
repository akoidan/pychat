variable "linode_token" {}
variable "cloud_flare_zone_id" {}
variable "cloud_flare_api_token" {}
variable "domain_name" {}

module "linode" {
  source                  = "./linode"
  linode_token = var.linode_token
}

module "cloudflare" {
  source                  = "./cloudflare"
  cloud_flare_api_token = var.cloud_flare_api_token
  cloud_flare_zone_id = var.cloud_flare_zone_id
  domain_name = var.domain_name
  ip_address = module.linode.ip_address
}

module "helm" {
  source = "./helm"
  kubeconfig = module.linode.kubeconfig
  domain = var.domain_name
  ip_address = module.linode.ip_address
}
