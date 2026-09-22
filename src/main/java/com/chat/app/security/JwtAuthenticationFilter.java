package com.chat.app.security;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {


    @Autowired
    private JwtService jwtService;


    @Autowired
    private CustomUserDetailsService customUserDetailsService;


    @Override
    protected boolean shouldNotFilter(
            HttpServletRequest request) {

        String path =
                request.getServletPath();


        /*
         * =========================================
         * PUBLIC AUTH ENDPOINTS
         * =========================================
         */

        if (path.equals("/auth/login")) {
            return true;
        }

        if (path.equals("/auth/register")) {
            return true;
        }


        /*
         * =========================================
         * PUBLIC PAGES
         * =========================================
         */

        if (path.equals("/")) {
            return true;
        }

        if (path.equals("/login.html")) {
            return true;
        }

        if (path.equals("/index.html")) {
            return true;
        }


        /*
         * =========================================
         * JAVASCRIPT FILES
         * =========================================
         */

        if (path.equals("/app.js")) {
            return true;
        }

        if (path.equals("/websocket.js")) {
            return true;
        }

        if (path.equals("/users.js")) {
            return true;
        }

        if (path.equals("/messages.js")) {
            return true;
        }

        if (path.startsWith("/js/")) {
            return true;
        }


        /*
         * =========================================
         * CSS
         * =========================================
         */

        if (path.startsWith("/css/")) {
            return true;
        }


        /*
         * =========================================
         * IMAGES
         * =========================================
         */

        if (path.startsWith("/images/")) {
            return true;
        }


        /*
         * =========================================
         * UPLOADS
         * =========================================
         */

        if (path.startsWith("/uploads/images/")) {
            return true;
        }

        if (path.startsWith("/uploads/files/")) {
            return true;
        }


        /*
         * =========================================
         * FAVICON
         * =========================================
         */

        if (path.equals("/favicon.ico")) {
            return true;
        }


        /*
         * =========================================
         * PUBLIC CHAT
         * =========================================
         */

        if (path.startsWith("/chat/")) {
            return true;
        }


        /*
         * =========================================
         * JWT REQUIRED
         * =========================================
         */

        return false;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {


        String authHeader =
                request.getHeader("Authorization");


        /*
         * =========================================
         * NO JWT
         * =========================================
         */

        if (
            authHeader == null ||
            !authHeader.startsWith("Bearer ")
        ) {

            filterChain.doFilter(
                request,
                response
            );

            return;
        }


        /*
         * =========================================
         * EXTRACT JWT
         * =========================================
         */

        String jwt =
                authHeader.substring(7);


        try {


            String username =
                    jwtService.extractUsername(jwt);


            /*
             * =====================================
             * USERNAME FOUND
             * =====================================
             */

            if (
                username != null &&
                SecurityContextHolder
                    .getContext()
                    .getAuthentication() == null
            ) {


            	UserDetails userDetails =
            	        customUserDetailsService
            	            .loadUserByUsername(
            	                username
            	            );


            	/*
            	 * =================================
            	 * CHECK ACCOUNT STATUS
            	 * =================================
            	 */

            	if (!userDetails.isEnabled()) {

            	    response.setStatus(
            	        HttpServletResponse.SC_FORBIDDEN
            	    );

            	    response.setContentType(
            	        "application/json"
            	    );

            	    response.getWriter().write(
            	        "{\"error\":\"Account is deactivated\"}"
            	    );

            	    return;
            	}


            	/*
            	 * =================================
            	 * VALIDATE TOKEN
            	 * =================================
            	 */

            	if (
            	    jwtService.isTokenValid(
            	        jwt,
            	        userDetails.getUsername()
            	    )
            	) {


                    UsernamePasswordAuthenticationToken
                        authentication =

                        new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                        );


                    SecurityContextHolder
                        .getContext()
                        .setAuthentication(
                            authentication
                        );

                }

            }


        }
        catch (Exception e) {

            SecurityContextHolder
                .clearContext();

            response.setStatus(
                HttpServletResponse.SC_UNAUTHORIZED
            );

            response.setContentType(
                "application/json"
            );

            response.getWriter().write(
                "{\"error\":\"JWT expired or invalid\"}"
            );

            return;
        }


        /*
         * =========================================
         * CONTINUE REQUEST
         * =========================================
         */

        filterChain.doFilter(
            request,
            response
        );

    }

}