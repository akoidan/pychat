module "linode" {
  source           = "./linode"
  linode_token     = var.linode_token
  linode_app_label = var.linode_app_label
}

module "cloudflare" {
  source                = "./cloudflare"
  cloud_flare_api_token = var.cloud_flare_api_token
  cloud_flare_zone_id   = var.cloud_flare_zone_id
  domain_name           = var.domain_name
  docker_domain_name    = local.docker_domain_name
  static_domain_name    = local.static_domain_name
  ip_address            = module.linode.ip_address
  htpasswd              = var.htpasswd
}

module "helm" {
  source                   = "./helm"
  kubeconfig               = module.linode.kubeconfig
  domain_name              = var.domain_name
  docker_domain_name       = local.docker_domain_name
  static_domain_name       = local.static_domain_name
  ip_address               = module.linode.ip_address
  cloud_flare_api_token    = var.cloud_flare_api_token
  email                    = var.email
  htpasswd                 = var.htpasswd
  github                   = var.github
  id_rsa                   = var.id_rsa
  id_rsa_pub               = var.id_rsa_pub
  SECRET_KEY               = var.SECRET_KEY
  RECAPTCHA_PRIVATE_KEY    = var.RECAPTCHA_PRIVATE_KEY
  RECAPTCHA_PUBLIC_KEY     = var.RECAPTCHA_PUBLIC_KEY
  GOOGLE_OAUTH_2_CLIENT_ID = var.GOOGLE_OAUTH_2_CLIENT_ID
  FACEBOOK_ACCESS_TOKEN    = var.FACEBOOK_ACCESS_TOKEN
  GIPHY_API_KEY            = var.GIPHY_API_KEY
  FIREBASE_API_KEY         = var.FIREBASE_API_KEY
  tls_crt                  = var.tls_crt
  tls_key                  = var.tls_key
  DEFAULT_PROFILE_ID       = var.DEFAULT_PROFILE_ID
}
