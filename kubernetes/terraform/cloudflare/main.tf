resource "cloudflare_record" "master_pychat" {
  name    = var.domain_name
  type    = "A"
  zone_id = var.cloud_flare_zone_id
  proxied = false
  ttl     = 1
  value   = var.ip_address
}

resource "cloudflare_record" "static_pychat" {
  name    = var.static_domain_name
  proxied = true
  ttl     = 1
  type    = "A"
  value   = var.ip_address
  zone_id = var.cloud_flare_zone_id
}

resource "cloudflare_record" "registry_pychat" {
  count = var.htpasswd == null ? 0 : 1
  name    = var.docker_domain_name
  proxied = false
  ttl     = 1
  type    = "A"
  value   = var.ip_address
  zone_id = var.cloud_flare_zone_id
}

resource "cloudflare_record" "www_pychat" {
  name    = "www"
  proxied = false
  ttl     = 1
  type    = "CNAME"
  value   = var.domain_name
  zone_id = var.cloud_flare_zone_id
}

resource "cloudflare_record" "postfix_pychat" {
  name    = var.domain_name
  proxied = false
  ttl     = 1
  type    = "TXT"
  value   = "v=spf1 ip4:${var.ip_address}"
  zone_id = var.cloud_flare_zone_id
}
