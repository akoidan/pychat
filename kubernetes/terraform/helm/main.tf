resource "helm_release" "global" {
  name  = "global"
  chart = "${path.module}/charts/global"
}

resource "helm_release" "backend" {
  name       = "backend"
  chart      = "${path.module}/charts/backend"
  depends_on = [helm_release.global, helm_release.mariadb, helm_release.redis]

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
  set {
    name  = "mysql_password"
    value = var.mysql_password
  }
  set {
    name  = "SECRET_KEY"
    value = var.SECRET_KEY
  }
  set {
    name  = "RECAPTCHA_PRIVATE_KEY"
    value = var.RECAPTCHA_PRIVATE_KEY
  }
  set {
    name  = "RECAPTCHA_PUBLIC_KEY"
    value = var.RECAPTCHA_PUBLIC_KEY
  }
  set {
    name  = "GOOGLE_OAUTH_2_CLIENT_ID"
    value = var.GOOGLE_OAUTH_2_CLIENT_ID
  }
  set {
    name  = "FACEBOOK_ACCESS_TOKEN"
    value = var.FACEBOOK_ACCESS_TOKEN
  }
  set {
    name  = "GIPHY_API_KEY"
    value = var.GIPHY_API_KEY
  }
  set {
    name  = "FIREBASE_API_KEY"
    value = var.FIREBASE_API_KEY
  }
  set {
    name  = "DEFAULT_PROFILE_ID"
    value = var.DEFAULT_PROFILE_ID
  }
}

resource "helm_release" "certmanager-definition" {
  name = "cert-manager-definition"
  chart = "jetstack/cert-manager"
  version = "1.12.0"
  namespace = "cert-manager"
  set {
    name = "installCRDs"
    value = true
  }
  depends_on = [helm_release.global]
}

resource "helm_release" "certmanager" {
  name  = "certmanager"
  chart = "${path.module}/charts/certmanager"
  set {
    name  = "domain_name"
    value = var.domain_name
  }
  set {
    name  = "email"
    value = var.email
  }
  set {
    name  = "cloud_flare_api_token"
    value = var.cloud_flare_api_token
  }
  depends_on = [helm_release.global, helm_release.certmanager-definition]
}

resource "helm_release" "self-signed" {
  count = var.cloud_flare_api_token == "" ? 1 : 0
  name  = "self-signed"
  chart = "${path.module}/charts/self-signed"
  set {
    name  = "tls_crt"
    value = var.tls_crt
  }
  set {
     name  = "tls_key"
    value = var.tls_key
  }
}

resource "helm_release" "backup" {
  count = var.github == ""? 1 : 0
  name       = "backup"
  chart      = "${path.module}/charts/backup"
  depends_on = [helm_release.mariadb, helm_release.backend] // because of pvc-photo

  set {
    name  = "email"
    value = var.email
  }
  set {
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
  set {
    name  = "mysql_password"
    value = var.mysql_password
  }
}

resource "helm_release" "coturn" {
  name       = "coturn"
  chart      = "${path.module}/charts/coturn"
  depends_on = [helm_release.global, helm_release.certmanager, helm_release.self-signed]
}

resource "helm_release" "frontend" {
  name       = "frontend"
  chart      = "${path.module}/charts/frontend"
  depends_on = [helm_release.global, helm_release.backend] // because of pvc-photo
}

resource "helm_release" "ingress" {
  name  = "ingress"
  chart = "${path.module}/charts/ingress"
  set {
    name  = "domain_name"
    value = var.domain_name

  }
  set {
    name  = "external_ip"
    value = var.ip_address
  }
  depends_on = [helm_release.global, helm_release.certmanager, helm_release.self-signed]
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
}

resource "helm_release" "redis" {
  name       = "redis"
  chart      = "${path.module}/charts/redis"
  depends_on = [helm_release.global]
}
