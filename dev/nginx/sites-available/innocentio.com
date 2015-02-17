 # Reverse proxy definitions to services
include node-upstreams/innocentio.com.conf;

server {
    listen       80;
    server_name  dev.innocentio.com
                 uat.innocentio.com
                 innocentio.com;
                 
    client_max_body_size 1000M;

    # Endpoint mappings
    include node-endpoints/innocentio.com.conf;

    error_page  404              /404.html;
    error_page  500 502 503 504  /50x.html;
}