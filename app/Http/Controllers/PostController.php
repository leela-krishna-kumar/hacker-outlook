<?php

namespace App\Http\Controllers;

use App\Models\Post;
use DOMDocument;
use Illuminate\Http\Request;

class PostController extends Controller
{
    public function __construct()
    {
        $this->title = 'Hacker Outlook';
    }


    public function index(){

        $data['title'] = $this->title;

        $data['posts_carousel'] = Post::select('title', 'content', 'link')->where('image', '!=', null)->orderBy('views', 'DESC')->limit(10)->get();

        $data['top_story_big'] = Post::where('category', 'top_stories')->where('image', '!=', null)
        ->orderBy('id', 'DESC')->limit(12)->get();

        $data['top_story_small1'] = Post::where('category', 'top_stories')->where('image', '!=', null)
        ->orderBy('id', 'DESC')->limit(20)->offset(15)->get();

        $data['top_story_small2'] = Post::where('category', 'top_stories')->where('image', '!=', null)
        ->orderBy('id', 'DESC')->limit(20)->offset(35)->get();

        $data['top_story_trending'] = Post::where('image', null)->orderBy('views', 'DESC')->limit(45)->offset(15)->get();


        // dd($data['posts_carousel']);

        // $url = "https://news.google.com/rss/articles/CBMibkFVX3lxTFBQZTdOVlFTdkV1Q21hbjlqZ0xReTRSWUZRaGtZQ2hlcjBOcmFwWlBmNVdYb2tIZnZuU0dmaGNfNTAxWE1oV2VFNks3SUFoSnNnY2htcnpkNDE0X3FsMkVsWU1UeXN1TjJRQm9zdmln?oc=5";
        // $redirectLink = $this->getRedirectingLink($url);

        // dd($redirectLink);


        return view('index', $data);
    }

    public function getRedirectingLink($url)
    {
        // Initialize cURL session
        $ch = curl_init($url);

        dd($ch);

        // Set cURL options to follow redirects
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_HEADER, true); // Include headers in output

        // Execute cURL request
        curl_exec($ch);

        // Get the final redirected URL
        $redirectedUrl = curl_getinfo($ch, CURLINFO_EFFECTIVE_URL);

        // Check for cURL errors
        if (curl_errno($ch)) {
            echo 'cURL Error: ' . curl_error($ch);
            curl_close($ch);
            return null;
        }

        // Close cURL session
        curl_close($ch);

        return $redirectedUrl;
    }
}
