terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "3.35.0"
    }
  }
}


provider "cloudflare" {
  api_token = var.cloud_flare_api_token
}

resource "cloudflare_record" "server" {
  zone_id = var.cloud_flare_zone_id
  name    = var.domain_name
  value   = var.ip_address
  proxied = true // Cloudflare support websockets now
  type    = "A"
}

resource "cloudflare_record" "master_pychat" {
  name    = var.domain_name
  proxied = false
  ttl     = 1
  type    = "A"
  value   = var.ip_address
  zone_id = var.cloud_flare_zone_id
}

resource "cloudflare_record" "static_pychat" {
  name    = "static"
  proxied = true
  ttl     = 1
  type    = "A"
  value   =  var.ip_address
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
