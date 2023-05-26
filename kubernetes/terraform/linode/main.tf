resource "linode_lke_cluster" "pychat" {
    k8s_version = var.k8s_version
    label =  var.linode_app_label
    region = var.region

    pool {
      count = 1
      type  = var.node_type
    }
}

data "linode_instances" "pychat_linode" {
}
