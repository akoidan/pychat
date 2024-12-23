output "kubeconfig" {
  value     = linode_lke_cluster.pychat.kubeconfig
  sensitive = true
}

output "api_endpoints" {
  value = linode_lke_cluster.pychat.api_endpoints
}

output "status" {
  value = linode_lke_cluster.pychat.status
}

output "id" {
  value = linode_lke_cluster.pychat.id
}

output "pool" {
  value = linode_lke_cluster.pychat.pool
}

output "ip_address" {
  value = data.linode_instances.pychat_linode.instances.0.ip_address
}
