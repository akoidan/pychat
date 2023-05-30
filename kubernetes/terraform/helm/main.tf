resource "helm_release" "global" {
  name  = "global"
  chart = "${path.module}/charts/global"
}

resource "helm_release" "backend" {
  name       = "backend"
  chart      = "${path.module}/charts/backend"
  depends_on = [
    helm_release.global,
    helm_release.mariadb,
    helm_release.redis,
    helm_release.photo,
    helm_release.backup // backup will restore database state if it exists, so it should go first, otherwise backend will create its own
  ]

  set {
    name  = "domain_name"
    value = var.domain_name
  }
  set {
    name  = "mysql_database_name"
    value = var.mysql_database_name
  }
  set_sensitive {
    name  = "mysql_user"
    value = var.mysql_user
  }
  set_sensitive {
    name  = "mysql_password"
    value = var.mysql_password
  }
  set_sensitive {
    name  = "SECRET_KEY"
    value = var.SECRET_KEY
  }
  set_sensitive {
    name  = "RECAPTCHA_PRIVATE_KEY"
    value = var.RECAPTCHA_PRIVATE_KEY
  }
  set_sensitive {
    name  = "GOOGLE_OAUTH_2_CLIENT_ID"
    value = var.GOOGLE_OAUTH_2_CLIENT_ID
  }
  set_sensitive {
    name  = "FACEBOOK_ACCESS_TOKEN"
    value = var.FACEBOOK_ACCESS_TOKEN
  }
  set_sensitive {
    name  = "FIREBASE_API_KEY"
    value = var.FIREBASE_API_KEY
  }
  set {
    name  = "DEFAULT_PROFILE_ID"
    value = var.DEFAULT_PROFILE_ID
  }
  timeout = 60
}

resource "helm_release" "certmanager-definition" {
  name      = "cert-manager-definition"
  chart     = "jetstack/cert-manager"
  version   = "1.12.0"
  namespace = "cert-manager"
  set {
    name  = "installCRDs"
    value = true
  }
  depends_on = [helm_release.global]
}

resource "helm_release" "certmanager" {
  count = var.use_certmanager ? 1 : 0
  name  = "certmanager"
  chart = "${path.module}/charts/certmanager"
  set {
    name  = "domain_name"
    value = var.domain_name
  }
  set {
    name  = "docker_domain_name"
    value = var.docker_domain_name
  }
  set {
    name  = "static_domain_name"
    value = var.static_domain_name
  }
  set {
    name  = "htpasswd"
    value = var.htpasswd == null ? "" : var.htpasswd
  }
  set {
    name  = "email"
    value = var.email
  }
  set_sensitive {
    name  = "cloud_flare_api_token"
    value = var.cloud_flare_api_token
  }
  depends_on = [helm_release.global, helm_release.certmanager-definition]
}

resource "helm_release" "self-signed" {
  count = var.use_certmanager ? 0 : 1
  name  = "self-signed"
  chart = "${path.module}/charts/self-signed"
  set_sensitive {
    name  = "tls_crt"
    value = var.tls_crt
  }
  set_sensitive {
    name  = "tls_key"
    value = var.tls_key
  }
  depends_on = [helm_release.global]
}

resource "helm_release" "docker-registry" {
  count = var.htpasswd == null ? 0 : 1
  name  = "docker-registry"
  chart = "${path.module}/charts/docker-registry"
  set {
    name  = "docker_domain_name"
    value = var.docker_domain_name
  }
  set_sensitive {
    name  = "htpasswd"
    value = var.htpasswd
  }
  depends_on = [helm_release.global]
}

resource "helm_release" "backup" {
  count      = var.github == null ? 0 : 1
  name       = "backup"
  chart      = "${path.module}/charts/backup"
  depends_on = [helm_release.mariadb, helm_release.photo]

  set_sensitive {
    name  = "id_rsa"
    value = var.id_rsa
  }
  set {
    name  = "id_rsa_pub"
    value = var.id_rsa_pub
  }
  set {
    name  = "github"
    value = var.github
  }
  set {
    name  = "domain_name"
    value = var.domain_name
  }
  set {
    name  = "mysql_database_name"
    value = var.mysql_database_name
  }
  set {
    name  = "mysql_user"
    value = var.mysql_user
  }
  set_sensitive {
    name  = "mysql_password"
    value = var.mysql_password
  }
  # Backup should restore the database state before backend goes up
  timeout = 1800 # Practically my backup was running for 20m until it finished
  wait_for_jobs = true
  wait = true
}
resource "helm_release" "photo" {
  name = "photo"
  chart  = "${path.module}/charts/photo"
  depends_on = [helm_release.global]
}

resource "helm_release" "coturn" {
  name       = "coturn"
  chart      = "${path.module}/charts/coturn"
  depends_on = [helm_release.global, helm_release.certmanager, helm_release.self-signed]

  set {
    name  = "domain_name"
    value = var.domain_name
  }
  set {
    name  = "username"
    value = var.coturn_username
  }
  set {
    name  = "password"
    value = var.coturn_password
  }
  set {
    name  = "udp_port_range_start"
    value = var.udp_port_range_start
  }
  set {
    name  = "udp_port_range_end"
    value = var.udp_port_range_end
  }
  wait = false # do not wait for certificate and block the execution
}

resource "helm_release" "frontend" {
  name       = "frontend"
  chart      = "${path.module}/charts/frontend"
  depends_on = [helm_release.global, helm_release.photo]
}

resource "helm_release" "ingress" {
  name  = "ingress"
  chart = "${path.module}/charts/ingress"
  set {
    name  = "domain_name"
    value = var.domain_name
  }
  set_sensitive {
    name  = "htpasswd"
    value = var.htpasswd == null ? "" : var.htpasswd
  }
  set {
    name  = "external_ip"
    value = var.ip_address
  }
  set {
    name  = "udp_port_range_start"
    value = var.udp_port_range_start
  }
  set {
    name  = "udp_port_range_end"
    value = var.udp_port_range_end
  }
  set {
    name  = "static_domain_name"
    value = var.static_domain_name
  }
  set {
    name  = "docker_domain_name"
    value = var.docker_domain_name
  }
  depends_on = [helm_release.global]
}

resource "helm_release" "mariadb" {
  name       = "mariadb"
  chart      = "${path.module}/charts/mariadb"
  depends_on = [helm_release.global]
  set {
    name  = "mysql_database_name"
    value = var.mysql_database_name
  }
  set {
    name  = "mysql_user"
    value = var.mysql_user
  }
  set {
    name  = "mysql_password"
    value = var.mysql_password
  }
}

resource "helm_release" "postfix" {
  name       = "postfix"
  chart      = "${path.module}/charts/postfix"
  depends_on = [helm_release.global, helm_release.certmanager, helm_release.self-signed]
  set {
    name  = "domain_name"
    value = var.domain_name
  }
  wait = false # do not wait for certificate and block the execution
}

resource "helm_release" "redis" {
  name       = "redis"
  chart      = "${path.module}/charts/redis"
  depends_on = [helm_release.global]
}
